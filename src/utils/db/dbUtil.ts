import loki, { LokiFsAdapter } from 'lokijs';
import { v4 as uuidv4 } from 'uuid';
import { getGlobalPath } from '../../extension';
import { formatDate } from '../helper';
import { writeLog } from '../logger/logger';
import { collectionDBPath, historyDBPath, mainDBPath, variableDBPath } from './consts';


export function CreateHistoryDB(): any {

  let db: LokiConstructor;

  try {
    const idbAdapter = new LokiFsAdapter();
    db = new loki(getGlobalPath() + "\\" + historyDBPath, {
      autoload: true,
      autoloadCallback: dbInitialize,
      autosave: true,
      autosaveInterval: 4000,
      serializationMethod: "normal",
      adapter: idbAdapter,
    });
  }
  catch (err: any) {
    writeLog("error::CreateHistoryDB(): " + err);
  }


  function dbInitialize() {
    try {
      const userHistory = db.getCollection('userHistory');
      if (userHistory === null) {
        db.addCollection("userHistory", { autoupdate: true, disableMeta: true, unique: ["id"], indices: "id" });
      }

      db.saveDatabase();
    }
    catch (err: any) {
      writeLog("error::CreateHistoryDB()::dbInitialize(): " + err);
    }
  }
}

export function CreateCollectionDB(): any {

  let db: LokiConstructor;

  try {
    const idbAdapter = new LokiFsAdapter();
    db = new loki(getGlobalPath() + "\\" + collectionDBPath, {
      autoload: true,
      autoloadCallback: dbInitialize,
      autosave: true,
      autosaveInterval: 4000,
      serializationMethod: "normal",
      adapter: idbAdapter,
    });
  }
  catch (err: any) {
    writeLog("error::CreateCollectionDB(): " + err);
  }


  function dbInitialize() {
    try {

      let userCollections = db.getCollection('userCollections');
      if (userCollections === null) {
        userCollections = db.addCollection("userCollections", { autoupdate: true, disableMeta: true, unique: ["id"], indices: ["id", "variableId"] });
      }

      userCollections.insert({ id: uuidv4(), name: "Default", variableId: "", createdTime: formatDate(), data: [] });

      db.saveDatabase();
    }
    catch (err: any) {
      writeLog("error::CreateCollectionDB()::dbInitialize(): " + err);
    }
  }
}


export function CreateMainDB(): any {

  let db: LokiConstructor;

  try {
    const idbAdapter = new LokiFsAdapter();
    db = new loki(getGlobalPath() + "\\" + mainDBPath, {
      autoload: true,
      autoloadCallback: dbInitialize,
      autosave: true,
      autosaveInterval: 4000,
      serializationMethod: "normal",
      adapter: idbAdapter,
    });
  }
  catch (err: any) {
    writeLog("error::CreateMainDB(): " + err);
  }


  function dbInitialize() {
    try {
      const apiRequests = db.getCollection('apiRequests');
      if (apiRequests === null) {
        db.addCollection("apiRequests", { autoupdate: true, disableMeta: true, unique: ["id"], indices: "id" });
      }
      db.saveDatabase();
    }
    catch (err: any) {
      writeLog("error::CreateMainDB::dbInitialize(): " + err);
    }
  }
}


export function CreateVariableDB(): any {

  let db: LokiConstructor;

  try {
    const idbAdapter = new LokiFsAdapter();
    db = new loki(getGlobalPath() + "\\" + variableDBPath, {
      autoload: true,
      autoloadCallback: dbInitialize,
      autosave: true,
      autosaveInterval: 4000,
      serializationMethod: "normal",
      adapter: idbAdapter,
    });
  }
  catch (err: any) {
    writeLog("error::CreateVariableDB(): " + err);
  }


  function dbInitialize() {
    try {

      let userCollections = db.getCollection('userVariables');
      if (userCollections === null) {
        userCollections = db.addCollection("userVariables", { autoupdate: true, disableMeta: true, unique: ["id"], indices: "id" });
      }

      userCollections.insert({ id: uuidv4(), name: "Global", isActive: true, createdTime: formatDate(), data: [] });

      db.saveDatabase();
    }
    catch (err: any) {
      writeLog("error::CreateVariableDB()::dbInitialize(): " + err);
    }
  }
}