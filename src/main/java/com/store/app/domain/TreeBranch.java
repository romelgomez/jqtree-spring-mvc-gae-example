package com.store.app.domain;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;

public class TreeBranch {

    // name,parent,left,right

    private static final String TREE_ENTITY     = "TreeBranch";
    private static final String NAME            = "name";
    private static final String PARENT_ID       = "parent_id";
    private static final String LEFT            = "left";
    private static final String RIGHT           = "right";

    private Entity entity;

    // For created new nodo
    public TreeBranch(final String name, final String parent_id, final Long left, final Long right,Key parent_entity_key){

        entity = new Entity(TREE_ENTITY,parent_entity_key);

        entity.setProperty(NAME,        name);
        entity.setProperty(PARENT_ID,   parent_id);
        entity.setProperty(LEFT,        left);
        entity.setProperty(RIGHT,       right);

    }


    public String getName() {
        return (String) entity.getProperty(NAME);
    }

    public String getParent() {
        return (String) entity.getProperty(PARENT_ID);
    }

    public Long getLeft() {
        return (Long) entity.getProperty(LEFT);
    }

    public  Long getRight() {
        return (Long) entity.getProperty(RIGHT);
    }

    public Entity getEntity() {
        return entity;
    }


}
