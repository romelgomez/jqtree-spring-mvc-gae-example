package com.store.app.domain;

import com.google.appengine.api.datastore.Entity;


public class Tree {
// name,parent,left,right

    private static final String TREE_ENTITY     = "Tree";
    private static final String NAME            = "name";
    private static final String DESCRIPTION     = "description";

    private Entity entity = new Entity(TREE_ENTITY,"tree");

    // For created new nodo
    public Tree(final String name,final String description){
        entity.setProperty(NAME,        name);
        entity.setProperty(DESCRIPTION, description);
    }

    public String getName() {
        return (String) entity.getProperty(NAME);
    }

    public String getDescription() {
        return (String) entity.getProperty(DESCRIPTION);
    }

    public Entity getEntity() {
        return entity;
    }

}