const { connectToDatabase } = require('../database');

class metricContentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(metric_name, description){
    const query = "INSERT INTO MetricContent (metric_id, metric_name, description) VALUES (NULL, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(metric_name, description);

    return {id: info.lastInsertRowid, metric_name, description};
  }

  retrieve(metric_id){
    const query = "SELECT * FROM MetricContent WHERE metric_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(metric_id);

    return info;
  }

  update(metric_id, metric_name, description){
    const query = "UPDATE MetricContent SET metric_name = ?, description = ? WHERE metric_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(metric_name, metric_id, description);

    return this.retrieve(metric_id);
  }

  delete(metric_id){
    const query = "DELETE FROM MetricContent WHERE metric_id = ?";

    const deleted_info = retrieve(metric_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(metric_id);

    return deleted_info;
  }
}

module.exports = metricContentModel;