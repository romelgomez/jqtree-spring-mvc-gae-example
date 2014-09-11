package com.store.app.controller;

import com.store.app.service.TreeServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;

/**
 * CategoriesController
 * User: romel
 * Date: 17/07/13
 * Time: 09:24 PM
 */

@Controller
@RequestMapping("/")
public class CategoriesController {

    TreeServiceInterface treeService;

    @Autowired
    public CategoriesController(TreeServiceInterface todoListService){
        this.treeService = todoListService;
    }

    @RequestMapping(method = RequestMethod.GET)
    public String index() {
        return "Categories/index";
    }


    @RequestMapping(value = "get-tree", method=RequestMethod.POST, headers = "Accept=application/json")
    @ResponseBody
    public ArrayList<ModelMap> getTree() {

        return treeService.getTree();

    }

    @RequestMapping(value = "new-category", method=RequestMethod.POST, headers = "Accept=application/json")
    @ResponseBody
    public ModelMap newCategory(@RequestBody ModelMap map) {

        String name = map.get("name").toString();
        return  treeService.save(name);

    }

    @RequestMapping(value = "delete-category", method=RequestMethod.POST, headers = "Accept=application/json")
    @ResponseBody
    public ModelMap deleteCategory(@RequestBody ModelMap map) {

        return  treeService.deleteCategory(map);

    }

    @RequestMapping(value = "update-tree", method=RequestMethod.POST, headers = "Accept=application/json")
    @ResponseBody
    public ModelMap updateTree(@RequestBody ModelMap map) {
        return  treeService.updateTree(map);
    }

    @RequestMapping(value = "edit-category", method=RequestMethod.POST, headers = "Accept=application/json")
    @ResponseBody
    public ModelMap editCategory(@RequestBody ModelMap map) {

        return  treeService.editCategory(map);

    }


}
