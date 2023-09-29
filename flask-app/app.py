from flask import Flask, request, jsonify
from flask_cors import CORS
from cassandra.cluster import Cluster
from arango import ArangoClient
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

### Cassandra db initialization
cluster = Cluster(contact_points=['cassandra-seed'], port=9042)
session = cluster.connect()

## for keyspace
session.execute("""
    CREATE KEYSPACE IF NOT EXISTS test_699
    WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 2};
""")
session.execute("""USE test_699""")
session.execute("""
        CREATE TABLE IF NOT EXISTS test (
            email text,
            name text,
            age text,
            PRIMARY KEY (email)
        );
    """)
session.execute("""
        CREATE TABLE IF NOT EXISTS customer_events (
        customer_id TEXT,
        customer_name TEXT,
        event_time TIMESTAMP,
        current_node_label TEXT,
        previous_node_label TEXT,
        PRIMARY KEY (customer_id, current_node_label, event_time)
        );
""")


### ArangoDb initialization
client = ArangoClient(hosts='http://arangodb:8529')
db = client.db('_system', username='root', password='123456')

## create petri net graph
if not db.has_graph('petri_net_graph'):
    petri_net_graph = db.create_graph('petri_net_graph')
else:
    petri_net_graph = db.graph('petri_net_graph')

## create place, transition, flow
if not db.has_collection('places'):
    db.create_collection('places')
    
if not db.has_collection('transitions'):
    db.create_collection('transitions')

if not db.has_collection('flows'):
    db.create_collection('flows', edge=True)

if not petri_net_graph.has_vertex_collection('places'):
    petri_net_graph.create_vertex_collection('places')
if not petri_net_graph.has_vertex_collection('transitions'):
    petri_net_graph.create_vertex_collection('transitions')
if not petri_net_graph.has_edge_definition('flows'):
    petri_net_graph.create_edge_definition(
        edge_collection='flows',
        from_vertex_collections=['places', 'transitions'],
        to_vertex_collections=['places', 'transitions']
    )

@app.route('/')
def test_flask():
    return "Welcome to db Flask server!"

@app.route('/insert_cassandra')
def insert_data_cassandra():
    try:
        data = {'name':'Zejun', 'age':'21', 'email':'zzhou443@wisc.edu'}
        name = data.get('name')
        age = data.get('age')
        email = data.get('email')
        
        session.execute("INSERT INTO test_699.test (email, name, age) VALUES (%s, %s, %s)", (email, name, age))
        
        return jsonify({"status": "success", "message": "Data inserted successfully"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/get_cassandra')
def get_data_cassandra():
    try:
        rows = session.execute("SELECT * FROM test_699.test")
        result = [{"name": row.name, "age": row.age, 'email':row.email} for row in rows]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/create_event', methods=['POST'])
def create_event():
    try:
        data = request.json
        customer_name = data.get('customer_name')
        current_node_label = data.get('current_node_label')
        previous_node_label = data.get('previous_node_label', 'start node') 
        
        customer_id = '123456'
        
        # Get the current timestamp for event time
        event_time = datetime.utcnow()
        
        session.execute("""
            INSERT INTO test_699.customer_events (customer_id, customer_name, event_time, current_node_label, previous_node_label)
            VALUES (%s, %s, %s, %s, %s)
        """, (customer_id, customer_name, event_time, current_node_label, previous_node_label))

        ## create graph in arango 
        if current_node_label in ['waiting', 'busy', 'idle']:
            # create or update place
            db.collection('places').insert({'_key': current_node_label}, overwrite=True)
        elif current_node_label in ['enter', 'serve', 'done']:
            # create or update transition
            db.collection('transitions').insert({'_key': current_node_label}, overwrite=True)

        if previous_node_label != 'start node':
            # create or update flow
            previous_event_time = get_previous_event_time(customer_id, previous_node_label)
            weight = (event_time - previous_event_time).total_seconds()
            from_vertex = ('transitions/' if previous_node_label in ['enter', 'serve', 'done'] else 'places/') + previous_node_label
            to_vertex = ('places/' if current_node_label in ['waiting', 'busy', 'idle'] else 'transitions/') + current_node_label
            flow_key = (from_vertex + '-' + to_vertex).replace('/', '-')
            # db.collection('flows').insert({'_key': flow_key, '_from': from_vertex, '_to': to_vertex, 'weight': weight}, overwrite=True)
            try:
                db.collection('flows').insert({'_key': flow_key, '_from': from_vertex, '_to': to_vertex, 'weight': weight}, overwrite=True)
            except Exception as e:
                print(f"Error inserting/updating flows collection. flow_key: {flow_key}, from_vertex: {from_vertex}, to_vertex: {to_vertex}, weight: {weight}, Error: {str(e)}")
                return jsonify({"status": "error", "message": f"Error inserting/updating flows collection. flow_key: {flow_key}, from_vertex: {from_vertex}, to_vertex: {to_vertex}, weight: {weight}, Error: {str(e)}"}), 400

        return jsonify({"status": "success", "message": "Event created successfully"}), 200

    except Exception as e:
        ##print(flow_key, "  ", from_vertex, "  ", to_vertex, "  ", weight)
        return jsonify({"status": "error", "message": str(e)}), 400

def get_previous_event_time(customer_id, previous_node_label):
    try:
        # Get the most recent event_time for the given customer_id and previous_node_label
        query = """
            SELECT event_time
            FROM test_699.customer_events
            WHERE customer_id = %s AND current_node_label = %s
            ORDER BY event_time DESC
            LIMIT 1;
        """
        rows = session.execute(query, (customer_id, previous_node_label))
        if rows:
            return rows[0].event_time  
        else:
            raise ValueError(f"No event found for customer_id={customer_id} and current_node_label={previous_node_label}")
    except Exception as e:
        raise ValueError(f"Error fetching previous event_time: {str(e)}")

@app.route('/get_event')
def get_event():
    try:
        rows = session.execute("SELECT * FROM test_699.customer_events")
        result = [{"customer id": row.customer_id, "customer name": row.customer_name, "event time": row.event_time, "current node": row.current_node_label, "previous node": row.previous_node_label} for row in rows]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route('/insert_arango')
def insert_data_arango():
    try:
        # Hardcoded data to insert
        data = {'name': 'zejun', 'age': 21, 'email': 'zzhou443@wisc.edu'}
        
        # Insert the data into a collection named "test"
        # Create the collection if it does not exist
        if not db.has_collection('test'):
            db.create_collection('test')
        
        db.collection('test').insert(data)
        
        return jsonify({"status": "success", "message": "Data inserted successfully"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route('/get_arango')
def get_data_arango():
    try:
        cursor = db.collection('test').all()
        
        result = [document for document in cursor]
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    

if __name__ == '__main__':
    app.run(port=5001)