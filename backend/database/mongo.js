const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class InMemoryMongoCollection {
  constructor(name, filePath) {
    this.name = name;
    this.filePath = filePath;
    this._data = {};
    this._load();
  }

  _load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this._data = JSON.parse(raw);
      } catch (e) {
        this._data = {};
      }
    } else {
      this._data = {};
    }
  }

  _save() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(this._data, null, 2), 'utf-8');
  }

  findOne(filter) {
    for (const id in this._data) {
      const doc = this._data[id];
      let match = true;
      for (const k in filter) {
        if (doc[k] !== filter[k]) {
          match = false;
          break;
        }
      }
      if (match) return { ...doc };
    }
    return null;
  }

  find(filter = {}) {
    const results = [];
    for (const id in this._data) {
      const doc = this._data[id];
      let match = true;
      for (const k in filter) {
        if (typeof filter[k] === 'object' && filter[k] !== null && filter[k]['$in']) {
          if (!filter[k]['$in'].includes(doc[k])) {
            match = false;
            break;
          }
        } else if (doc[k] !== filter[k]) {
          match = false;
          break;
        }
      }
      if (match) results.push({ ...doc });
    }
    return results;
  }

  insertOne(doc) {
    if (!doc.id) {
      doc.id = uuidv4();
    }
    this._data[doc.id] = { ...doc };
    this._save();
    return doc;
  }

  updateOne(filter, update) {
    const doc = this.findOne(filter);
    if (doc) {
      const docId = doc.id;
      if (update['$set']) {
        for (const k in update['$set']) {
          this._data[docId][k] = update['$set'][k];
        }
      }
      if (update['$push']) {
        for (const k in update['$push']) {
          if (!this._data[docId][k]) {
            this._data[docId][k] = [];
          }
          this._data[docId][k].push(update['$push'][k]);
        }
      }
      this._save();
      return true;
    }
    return false;
  }

  deleteOne(filter) {
    const doc = this.findOne(filter);
    if (doc) {
      delete this._data[doc.id];
      this._save();
      return true;
    }
    return false;
  }

  countDocuments(filter = {}) {
    return this.find(filter).length;
  }
}

class DatabaseManager {
  constructor() {
    this.storageDir = path.join(__dirname, '..', 'data_store');
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
    this.collections = {};
  }

  getCollection(name) {
    if (!this.collections[name]) {
      const filePath = path.join(this.storageDir, `${name}.json`);
      this.collections[name] = new InMemoryMongoCollection(name, filePath);
    }
    return this.collections[name];
  }
}

module.exports = new DatabaseManager();
