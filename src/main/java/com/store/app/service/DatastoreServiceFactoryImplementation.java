package com.store.app.service;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import org.springframework.stereotype.Service;

@Service
public class DatastoreServiceFactoryImplementation implements DatastoreServiceFactoryInterface {

    private DatastoreService datastoreService = DatastoreServiceFactory.getDatastoreService();

    public DatastoreService getDatastoreService(){
        return datastoreService;
    }

}