from flask import Flask, request, jsonify
from flask_cors import CORS
from cassandra.cluster import Cluster
from arango import ArangoClient
import uuid
import json
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
        customer_email TEXT,
        customer_name TEXT,
        event_time TIMESTAMP,
        current_node_label TEXT,
        previous_node_label TEXT,
        PRIMARY KEY (customer_email, current_node_label, event_time)
        );
""")


### for node table cassandra
session.execute("""
    CREATE TABLE IF NOT EXISTS nodes (
        customer_email text,
        node_id text,
        type text,
        position map<text, float>,
        label text,
        style map<text, text>,
        tokens list<frozen<map<text, text>>>,
        transitions text,
        PRIMARY KEY (customer_email, node_id)
    );
""")

### for edge table cassandra
session.execute("""
    CREATE TABLE IF NOT EXISTS edges (
        customer_email text,
        edge_id text,
        source text,
        target text,
        type text,
        label text,
        animated boolean,
        style map<text, text>,
        PRIMARY KEY (customer_email, edge_id)
    );
""")

### for token table cassandra
session.execute("""
    CREATE TABLE IF NOT EXISTS tokens (
        customer_email text,
        token_id text,
        node_id text,
        color text,
        property list<frozen<map<text, text>>>,
        style map<text, text>,
        PRIMARY KEY (customer_email, token_id)
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

# @app.route('/insert_cassandra')
# def insert_data_cassandra():
#     try:
#         data = {'name':'Zejun', 'age':'21', 'email':'zzhou443@wisc.edu'}
#         name = data.get('name')
#         age = data.get('age')
#         email = data.get('email')
        
#         session.execute("INSERT INTO test_699.test (email, name, age) VALUES (%s, %s, %s)", (email, name, age))
        
#         return jsonify({"status": "success", "message": "Data inserted successfully"}), 200
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 400

# @app.route('/get_cassandra')
# def get_data_cassandra():
#     try:
#         rows = session.execute("SELECT * FROM test_699.test")
#         result = [{"name": row.name, "age": row.age, 'email':row.email} for row in rows]
#         return jsonify(result), 200
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 400

# @app.route('/create_event', methods=['POST'])
# def create_event():
#     try:
#         data = request.json
#         customer_email = data.get('customer_email')
#         customer_name = data.get('customer_name')
#         current_node_label = data.get('current_node_label')
#         previous_node_label = data.get('previous_node_label', 'start node') 
        
        
#         # Get the current timestamp for event time
#         event_time = datetime.utcnow()
        
#         session.execute("""
#             INSERT INTO test_699.customer_events (customer_email, customer_name, event_time, current_node_label, previous_node_label)
#             VALUES (%s, %s, %s, %s, %s)
#         """, (customer_email, customer_name, event_time, current_node_label, previous_node_label))

#         ## create graph in arango 
#         if current_node_label in ['waiting', 'busy', 'idle']:
#             # create or update place
#             db.collection('places').insert({'_key': current_node_label}, overwrite=True)
# #         elif current_node_label in ['enter', 'serve', 'done']:
# #             # create or update transition
# #             db.collection('transitions').insert({'_key': current_node_label}, overwrite=True)

# #         if previous_node_label != 'start node':
# #             # create or update flow
# #             previous_event_time = get_previous_event_time(customer_email, previous_node_label)
# #             weight = (event_time - previous_event_time).total_seconds()
# #             from_vertex = ('transitions/' if previous_node_label in ['enter', 'serve', 'done'] else 'places/') + previous_node_label
# #             to_vertex = ('places/' if current_node_label in ['waiting', 'busy', 'idle'] else 'transitions/') + current_node_label
# #             flow_key = (from_vertex + '-' + to_vertex).replace('/', '-')
# #             # db.collection('flows').insert({'_key': flow_key, '_from': from_vertex, '_to': to_vertex, 'weight': weight}, overwrite=True)
# #             try:
# #                 db.collection('flows').insert({'_key': flow_key, '_from': from_vertex, '_to': to_vertex, 'weight': weight}, overwrite=True)
# #             except Exception as e:
# #                 print(f"Error inserting/updating flows collection. flow_key: {flow_key}, from_vertex: {from_vertex}, to_vertex: {to_vertex}, weight: {weight}, Error: {str(e)}")
# #                 return jsonify({"status": "error", "message": f"Error inserting/updating flows collection. flow_key: {flow_key}, from_vertex: {from_vertex}, to_vertex: {to_vertex}, weight: {weight}, Error: {str(e)}"}), 400

# #         return jsonify({"status": "success", "message": "Event created successfully"}), 200

# #     except Exception as e:
# #         ##print(flow_key, "  ", from_vertex, "  ", to_vertex, "  ", weight)
# #         return jsonify({"status": "error", "message": str(e)}), 400

# def get_previous_event_time(customer_email, previous_node_label):
#     try:
#         # Get the most recent event_time for the given customer_email and previous_node_label
#         query = """
#             SELECT event_time
#             FROM test_699.customer_events
#             WHERE customer_email = %s AND current_node_label = %s
#             ORDER BY event_time DESC
#             LIMIT 1;
#         """
#         rows = session.execute(query, (customer_email, previous_node_label))
#         if rows:
#             return rows[0].event_time  
#         else:
#             raise ValueError(f"No event found for customer_email={customer_email} and current_node_label={previous_node_label}")
#     except Exception as e:
#         raise ValueError(f"Error fetching previous event_time: {str(e)}")

# @app.route('/get_event')
# def get_event():
#     try:
#         rows = session.execute("SELECT * FROM test_699.customer_events")
#         result = [{"customer email": row.customer_email, "customer name": row.customer_name, "event time": row.event_time, "current node": row.current_node_label, "previous node": row.previous_node_label} for row in rows]
#         return jsonify(result), 200
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 400


@app.route('/insert_nodes', methods=['POST'])
def save_node():
    try:
        node = request.json
        session.execute(
            """
            INSERT INTO nodes (customer_email, node_id, type, position, label, style, tokens, transitions)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (node['customer_email'], node['id'], node['type'], node['position'], node['data']['label'], node['style'], node['data']['tokens'], node['data']['transitions'])
        )
        return jsonify({"status": "success", "message": "node inserted successfully"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route('/delete_node', methods=['DELETE'])
def delete_node():
    try:
        node_id = request.args.get('id')
        customer_email = request.args.get('customer_email')
        session.execute(
            """
            DELETE FROM nodes 
            WHERE node_id = %s AND customer_email = %s
            """,
            (node_id, customer_email)
        )
        select_query_source = """
        SELECT edge_id FROM edges WHERE customer_email = %s AND source = %s ALLOW FILTERING;
        """
        select_query_target = """
        SELECT edge_id FROM edges WHERE customer_email = %s AND target = %s ALLOW FILTERING;
        """
        rows_source = session.execute(select_query_source, (customer_email, node_id))
        rows_target = session.execute(select_query_target, (customer_email, node_id))
        edge_ids = [row.edge_id for row in rows_source] + [row.edge_id for row in rows_target]

        for edge_id in edge_ids:
            delete_query = """
            DELETE FROM edges WHERE customer_email = %s AND edge_id = %s;
            """
            session.execute(delete_query, (customer_email, edge_id))

        return jsonify({"status": "success", "message": "node deleted successfully"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route('/delete_edge', methods=['DELETE'])
def delete_edge():
    try:
        edge_id = request.args.get('id')
        customer_email = request.args.get('customer_email')
        session.execute(
            """
            DELETE FROM edges 
            WHERE edge_id = %s AND customer_email = %s
            """,
            (edge_id, customer_email)
        )
        return jsonify({"status": "success", "message": "edge deleted successfully"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/insert_edges', methods=['POST'])
def save_edge():
    try:
        edge = request.json
        session.execute(
            """
            INSERT INTO edges (customer_email, edge_id, source, target, animated, type, label)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (edge['customer_email'], edge['id'], edge['source'], edge['target'], edge['animated'], edge['type'], edge['data']['label'])
        )
        return jsonify({"status": "success", "message": "edge inserted successfully"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/get_nodes', methods = ['GET'])
def get_nodes():
    try:
        email = request.args.get('email')
        rows = session.execute('SELECT * FROM nodes WHERE customer_email=%s', (email,))
        nodes = []
        for row in rows:
            node = {
                'id': row.node_id, 
                'type': row.type, 
                'position': dict(row.position), 
                'data': {'label':row.label, 'transitions':row.transitions},
                'style': dict(row.style),
            }
            if row.tokens is not None:
                tokens = []
                for token in row.tokens:
                    tokens.append(dict(token))
                node['data']['tokens'] = tokens
            else:
                node['data']['tokens'] = []
            nodes.append(node)
        return jsonify(nodes)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route('/get_edges', methods = ['GET'])
def get_edges():
    try:
        email = request.args.get('email')
        rows = session.execute('SELECT * FROM edges WHERE customer_email=%s', (email,))
        edges = [{'id': row.edge_id, 'source': row.source, 'target': row.target, 'animated': row.animated, 'type': row.type, 'data':{'label':row.label}} for row in rows]
        return jsonify(edges)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route('/show_nodes')
def show_nodes():
    rows = session.execute('SELECT * FROM nodes')
    nodes = []
    for row in rows:
        node = {
            'customer_email':row.customer_email,
            'node_id': row.node_id, 
            'type': row.type, 
            'position': dict(row.position), 
            'data': {'label':row.label, 'transitions':row.transitions},
            'style': dict(row.style),
        }
        if row.tokens is not None:
            tokens = []
            for token in row.tokens:
                tokens.append(dict(token))
            node['data']['tokens'] = tokens
        else:
            node['data']['tokens'] = []
        nodes.append(node)
    return jsonify(nodes)
    

@app.route('/show_edges')
def show_edges():
    rows = session.execute('SELECT * FROM edges')
    edges = [{'customer_email': row.customer_email, 'edge_id': row.edge_id, 'source': row.source, 'target': row.target, 'animated': row.animated, 'type':row.type, 'data':{'label':row.label}} for row in rows]
    return jsonify(edges)


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