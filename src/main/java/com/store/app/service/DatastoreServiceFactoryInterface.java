package com.store.app.service;

import com.google.appengine.api.datastore.DatastoreService;

public interface DatastoreServiceFactoryInterface {
    public DatastoreService getDatastoreService();
}
