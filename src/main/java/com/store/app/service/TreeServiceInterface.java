package com.store.app.service;

import org.springframework.ui.ModelMap;

import java.util.ArrayList;

public interface TreeServiceInterface {
    public ArrayList<ModelMap> getTree();
    public ModelMap            save(String name);
    public ModelMap            updateTree(ModelMap map);
    public ModelMap            deleteCategory(ModelMap map);
    public ModelMap            editCategory(ModelMap map);
}
