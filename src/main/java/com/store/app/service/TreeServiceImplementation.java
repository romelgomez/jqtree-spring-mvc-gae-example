package com.store.app.service;

import com.google.appengine.api.datastore.*;
import com.store.app.domain.Tree;
import com.store.app.domain.TreeBranch;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.ui.ModelMap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class TreeServiceImplementation implements TreeServiceInterface {


    /*
        @Descripción    -> (EN) Get interfaces
    */

    DatastoreService datastoreService;

    @Autowired
    public TreeServiceImplementation(DatastoreServiceFactoryInterface datastoreServiceFactory){
        this.datastoreService = datastoreServiceFactory.getDatastoreService();
    }

    /*
        @Name           -> getTree
        @Descripción    -> (ES) Para obtener todas las entidades que están en el almacén de datos
        @parameters     -> {}
        @returns        -> ArrayList<ModelMap>
    */

    public ArrayList<ModelMap> getTree() {

        Key parent_entity_key = KeyFactory.createKey("Tree","tree");

        ArrayList<ModelMap> treeLists = new ArrayList<ModelMap>();

        Query query = new Query("TreeBranch");

        query.setAncestor(parent_entity_key);

        query.addSort("left", Query.SortDirection.ASCENDING);

        for(Entity entity:datastoreService.prepare(query).asIterable()){

            // Todo -> Organize Data as ModelMap Obj
            ModelMap model = organizeData(entity);

            treeLists.add(model);

        }

        return treeLists;
    }

    /*
        @Name           -> organizeData
        @Descripción    -> (ES) Para desglosar la entidad en un ModelMap Obj
        @parameters     -> {"entity":{"type":"Entity"}}
        @returns        -> ModelMap
    */
    private ModelMap organizeData(Entity entity){

        Map     properties   =              entity.getProperties();
        Key     key          =              entity.getKey();
        String  key_string   =              KeyFactory.keyToString(key);

        ModelMap data = new ModelMap();

        data.addAttribute("properties",     properties);
        data.addAttribute("id",             key_string);

        return data;
    }

    private ModelMap saveParentEntity(){

        Tree tree    = new Tree("tree","TreeBranch entity parent");
        Entity  entity  = tree.getEntity();

        Transaction transaction = datastoreService.beginTransaction();

        ModelMap result = new ModelMap();

        try {

            Key parent_entity_key = datastoreService.put(transaction,entity);

            transaction.commit();

            result.addAttribute("parent_entity_key",   parent_entity_key);
            result.addAttribute("save",                true);

        } catch (Exception e){

            result.addAttribute("exception",     e.getMessage());
            result.addAttribute("save",          false);

        }  finally {

            if(transaction.isActive()){
                transaction.rollback();
                result.addAttribute("transaction_is_active",    true);
                result.addAttribute("save",                     false);
            }

        }

        return result;
    }

    private ModelMap getParentEntity(Key key){

        Transaction transaction = datastoreService.beginTransaction();

        ModelMap result = new ModelMap();

        try {

            Entity parent_entity =  datastoreService.get(transaction,key);

            transaction.commit();

            Key parent_entity_key = parent_entity.getKey();

            result.addAttribute("parent_entity_key",   parent_entity_key);
            result.addAttribute("exists",              true);

        } catch (Exception e){

            result.addAttribute("exception",           e.getMessage());
            result.addAttribute("exists",              false);

        }  finally {

            if(transaction.isActive()){
                transaction.rollback();
                result.addAttribute("transaction_is_active",    true);
                result.addAttribute("exists", false);
            }

        }

        return result;
    }

    private ModelMap getParentEntityKey(){

        ModelMap result = new ModelMap();

        Key treeKey =  KeyFactory.createKey(Tree.class.getSimpleName(),"tree");

        ModelMap getMap = getParentEntity(treeKey);

//        System.out.println(getMap);

        Boolean exists = (Boolean) getMap.get("exists");

        if(exists){

            Key parent_entity_key = (Key) getMap.get("parent_entity_key");

            result.addAttribute("parent_entity_key",         parent_entity_key);
            result.addAttribute("get_status",                true);

        }else{

            ModelMap saveMap = saveParentEntity();

//            System.out.println(saveMap);

            Boolean save = (Boolean) saveMap.get("save");

            if(save){
                Key parent_entity_key = (Key) saveMap.get("parent_entity_key");
                result.addAttribute("parent_entity_key",     parent_entity_key);
                result.addAttribute("get_status",            true);

            }else{
                result.addAttribute("get_status",            false);
            }

        }


        return result;
    }

    private ModelMap saveChildEntity(String name,Key parent_entity_key){

        ModelMap result = new ModelMap();

        ArrayList<ModelMap> treeMap = getTree();

        Long registros_totales = (long) treeMap.size();
        Long left, right;

        if(registros_totales >= 1){
            Long limite_superior = registros_totales * 2;

            left    = limite_superior+1;
            right   = limite_superior+2;
        }else{
            left    = (long) 1;
            right   = (long) 2;
        }

        TreeBranch treeBranch = new TreeBranch(name,"",left,right,parent_entity_key);

        Entity     entity     = treeBranch.getEntity();

        Transaction transaction = datastoreService.beginTransaction();

        try {

            // save entity in dataStore
            Key key = datastoreService.put(transaction,entity);

            transaction.commit();

            result.addAttribute("save", true);

        }catch (Exception e){

            result.addAttribute("exception",    e.getMessage());
            result.addAttribute("save",         false);

        } finally {

            if(transaction.isActive()){
                transaction.rollback();
                result.addAttribute("transaction_is_active",    true);
                result.addAttribute("exists",                   false);
            }

        }

        return result;
    }

    /*
        @Name           -> save
        @Descripción    -> (ES) Para guardar la entidad en el almacén de datos
        @parameters     -> {"name":{"type":"String"}}
        @returns        -> ModelMap
    */

    public ModelMap save(String name){

        ModelMap result = new ModelMap();

        ModelMap getParentEntityKeyMap =  getParentEntityKey();

        Boolean get_status = (Boolean) getParentEntityKeyMap.get("get_status");

        if(get_status){

            Key parent_entity_key = (Key) getParentEntityKeyMap.get("parent_entity_key");

            // try save child entity
            // System.out.println("try save child entity");

            ModelMap saveChildEntityRequest = saveChildEntity(name,parent_entity_key);

            Boolean request_status  = (Boolean) saveChildEntityRequest.get("save");

            if(request_status){
                result.addAttribute("status",         true);
            }else{
                result.addAttribute("status",         false);
            }

        }else{
            // System.out.println("error when trying to save the new entity\n");
            result.addAttribute("status",         false);
        }

        result.addAttribute("tree",         getTree());

        return result;

    }

    public ModelMap deleteCategory(ModelMap map){

        ModelMap result = new ModelMap();


        // TODO -->  Entities to delete
        ArrayList<Key> keys_to_delete         = new ArrayList<Key>();

        for(Object object: (ArrayList) map.get("records_ids_for_delete")){

            String keyString = String.valueOf(object);

            Key key = KeyFactory.stringToKey(keyString);

            keys_to_delete.add(key);

        }

        // TODO -->  Entities to update
        ArrayList<Key> keys_to_update         = new ArrayList<Key>();

        HashMap<Key,Object> tree_properties = new HashMap<Key, Object>();

        for(Object object: (ArrayList) map.get("tree")){

            HashMap node    =  (HashMap) object;

            String  id      = String.valueOf(node.get("id"));

            Key     key     = KeyFactory.stringToKey(id);

            tree_properties.put(key,node.get("properties"));

            keys_to_update.add(key);

        }

        Transaction transaction = datastoreService.beginTransaction();

        try {

            datastoreService.delete(transaction,keys_to_delete);

            Map entityMap = datastoreService.get(transaction,keys_to_update);
            ArrayList<Entity> entityList = new ArrayList<Entity>();

            for (Key key : keys_to_update){

                Entity    entity        = (Entity) entityMap.get(key);
                HashMap   properties    = (HashMap) tree_properties.get(key);

                String name         = String.valueOf(properties.get("name"));
                String parent_id    = String.valueOf(properties.get("parent_id"));
                Long   left         = Long.valueOf((Integer)properties.get("left"));
                Long   right        = Long.valueOf((Integer)properties.get("right"));

                entity.setProperty("name",name);
                entity.setProperty("parent_id",parent_id);
                entity.setProperty("left",left);
                entity.setProperty("right",right);

                entityList.add(entity);

            }

            datastoreService.put(transaction,entityList);
            transaction.commit();

//            System.out.println("try-transaction.commit");

            result.addAttribute("status",true);

        }catch (Exception e){

            result.addAttribute("exception",e.getMessage());
            result.addAttribute("status",false);
            transaction.rollback();

        } finally {
            if(transaction.isActive()){
                result.addAttribute("status",false);
                transaction.rollback();
            }
            result.addAttribute("tree",getTree());
        }


        return result;
    }

    public ModelMap editCategory(ModelMap map){

        ModelMap result = new ModelMap();

        String id   = String.valueOf(map.get("id"));
        String name = String.valueOf(map.get("name"));

        Key     key     = KeyFactory.stringToKey(id);

        Transaction transaction = datastoreService.beginTransaction();

        try {

            Entity entity = datastoreService.get(transaction,key);

            entity.setProperty("name", name);

            datastoreService.put(transaction,entity);

            transaction.commit();

            result.addAttribute("status",true);

        }   catch (Exception e){

            result.addAttribute("exception",e.getMessage());
            result.addAttribute("status",false);
            transaction.rollback();

        } finally {
            if(transaction.isActive()){
                result.addAttribute("status",false);
                transaction.rollback();
            }

            result.addAttribute("tree",getTree());
        }


        return result;
    }

    public ModelMap updateTree(ModelMap map){

        // name, parent_id, left, right
        ModelMap result = new ModelMap();


        ArrayList<Key> keys         = new ArrayList<Key>();

        HashMap<Key,Object> tree_properties = new HashMap<Key, Object>();

        for(Object object: (ArrayList) map.get("tree")){

            HashMap node    =  (HashMap) object;

            String  id      = String.valueOf(node.get("id"));

            Key     key     = KeyFactory.stringToKey(id);

            tree_properties.put(key,node.get("properties"));

            keys.add(key);

        }


        Transaction transaction = datastoreService.beginTransaction();

        try {

           Map entityMap = datastoreService.get(transaction,keys);
           ArrayList<Entity> entityList = new ArrayList<Entity>();

           for (Key key : keys){

              Entity    entity        = (Entity) entityMap.get(key);
              HashMap   properties    = (HashMap) tree_properties.get(key);

              String name         = String.valueOf(properties.get("name"));
              String parent_id    = String.valueOf(properties.get("parent_id"));
              Long   left         = Long.valueOf((Integer)properties.get("left"));
              Long   right        = Long.valueOf((Integer)properties.get("right"));

              entity.setProperty("name",name);
              entity.setProperty("parent_id",parent_id);
              entity.setProperty("left",left);
              entity.setProperty("right",right);

              entityList.add(entity);

           }

           datastoreService.put(transaction,entityList);
           transaction.commit();

//           System.out.println("try-transaction.commit");

           result.addAttribute("status",true);

        } catch (Exception e){

           result.addAttribute("exception",e.getMessage());
           result.addAttribute("status",false);
           transaction.rollback();

//           System.out.println("Exception-transaction.rollback");  // this


        } finally {


            if(transaction.isActive()){
//                System.out.println("finally-transaction.rollback");

                result.addAttribute("status",false);
                transaction.rollback();
            }


            result.addAttribute("tree",getTree());
        }

        return result;
    }

}
