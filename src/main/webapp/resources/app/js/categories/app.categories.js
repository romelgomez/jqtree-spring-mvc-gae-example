$(document).ready(function() {


    (function( categories, $, undefined ) {

        /*
         @Name              -> treeElement
         @visibility        -> Private
         @Type              -> Property
         @Descripción       -> Dom element where tree is going be placed.
         @implemented by    -> categories.main(), displayJqTreeData(), replaceWholeTree(), treeSelect().
         */
        var treeElement;

        /*
         @Name              -> initEstate
         @visibility        -> Private
         @Type              -> Property
         @Descripción       -> Is use to determine if is necessary create new tree or replace all tree; new tree is necessary when at first load of the web there is no category or node; replace all tree is necessary when after delete all current nodes, is starting create new node.
         @implemented by    -> getTree(), newCategory()
         */
        var initEstate;

        /*
         @Name              -> displayJqTreeData
         @visibility        -> Private
         @Type              -> Method
         @Descripción       -> display initially JqTree Data.
         @parameters        -> treeData: JqTree data.
         @returns           -> null
         @implemented by    -> getTree()
         */
        var displayJqTreeData = function(treeData){
            var options = {
                dragAndDrop: true,
                selectable: true,
                autoEscape: false,
                autoOpen: true,
                data: treeData
            };

            treeElement.tree(options);
        };

        /*
         @Name              -> replaceWholeTree
         @visibility        -> Private
         @Type              -> Method
         @Descripción       -> Replace whole Tree.
         @parameters        -> treeData: JqTree data.
         @returns           -> null
         @implemented by    -> newCategory(), editCategoryName()
         */
        var replaceWholeTree = function(treeData){
            treeElement.tree('loadData', treeData);
        };


        /*
         @Name              -> packAsJqTreeNode
         @visibility        -> Private
         @Type              -> Method
         @Descripción       -> source node is packed as JqTree Node.
         @parameters        -> sourceNode: Source node, as is find in data store.
         @returns           -> JSON Object: JqTree Node
         @implemented by    -> sourceDataAsJqTreeData();
         */
        var packAsJqTreeNode = function(sourceNode){
            var node = {};

            node['id']         = sourceNode['id'];
            node['label']      = sourceNode['properties']['name'];
            node['parent_id']  = sourceNode['properties']['parent_id'];
            node['left']       = sourceNode['properties']['left'];
            node['right']      = sourceNode['properties']['right'];
            node['children']   = [];

            return node;
        };

        /*
         @Name              -> insertChildNode
         @visibility        -> Private
         @Type              -> Recursive Method
         @Descripción       -> (EN) Is like push(), only that this function completely traverses the tree looking for the father to the son or node  (ES) Hace las veces de push(), solo que esta función recorre el árbol completamente buscando el padre para el hijo o nodo.
         @parameters        -> tree: Target tree, childNode: child node
         @returns           -> null
         @implemented by    -> sourceDataAsJqTreeData();
         */
        var insertChildNode = function(targetTree,childNode){

            /* (ES) Para el objeto actual, si se detecta que es un objeto dependiente, se mapea recursivamente target_tree, donde si id del objeto dependiente es igual al
            el objeto para el momento en el bucle recursivo, quiere decir que tal objeto dependiente es hijo del objeto actual.
            */

            $(targetTree).each(function(index,node){
                if(node['id'] == childNode['parent_id']){
                    node['children'].push(childNode);
                }else{
                    if(node['children'].length > 0){
                        insertChildNode(node['children'],childNode);
                    }
                }
            });

            return null;
        };

        /*
         @Name              -> sourceDataAsJqTreeData
         @visibility        -> Private
         @Type              -> Method
         @Descripción       -> Format source data as JqTree data.
         @parameters        -> sourceData: server data.
         @returns           -> Array
         @implemented by    -> getTree(), newCategory(), editCategoryName();
         */
        var sourceDataAsJqTreeData = function(sourceData){
            var targetTree = [];

            $(sourceData).each(function(){
                //  jqTree Node
                var node  = packAsJqTreeNode(this);

                if(node['parent_id'] != ''){
                    // Is child node
                    // Recursive Function
                    insertChildNode(targetTree,node);
                }else{
                    // Is root node
                    // Se inserta el nodo directamente
                    targetTree.push(node);
                }
            });

            return targetTree;
        };


        /*
         @Name              -> logSourceData
         @visibility        -> Private
         @Type              -> Method
         @Descripción       -> Log source data as pretty print JSON.
         @parameters        -> treeData: JqTree data.
         @returns           -> null
         @implemented by    -> getTree();
         */
        var logSourceData = function(treeData){
            var jsonTree = "<pre class=\"prettyprint\" >"+JSON.stringify(treeData,null,'\t')+"</pre>";
            $("#source-data").html(jsonTree);
        };

        /*
         @Name              -> logSourceDataAsJqTreeData
         @visibility        -> Private
         @Type              -> Method
         @Descripción       -> Log source data as JqTree data as pretty print JSON.
         @parameters        -> treeData: JqTree data.
         @returns           -> null
         @implemented by    -> getTree();
         */
        var logSourceDataAsJqTreeData = function(treeData){
            var jsonTree = "<pre class=\"prettyprint\" >"+JSON.stringify(treeData,null,'\t')+"</pre>";
            $("#source-data-as-jqtree-data").html(jsonTree);
        };

        /*
         @Name              -> excludeNode
         @visibility        -> Private
         @Type              -> Recursive Method
         @Descripción       -> Prepare data for Google AppEngine DataStore.
         @parameters        -> tree: tree as JSON;
         @returns           -> Array of Objects
         @implemented by    -> deleteCategory(), treeMove();
         */
        var prepare_for_data_store = function(tree){

            var result = [];

            var process = function(tree){

                $(tree).each(function(index,node){

                    var data = {};

                    data['id']         = node['id'];

                    data['properties'] = {};

                    data['properties']['name']      = node['name'];
                    data['properties']['parent_id'] = node['parent_id'];
                    data['properties']['left']      = node['left'];
                    data['properties']['right']     = node['right'];

                    result.push(data);

                    if(node['children'].length > 0){
                        process(node['children']);
                    }

                });


            };

            process(tree);

            return result;
        };

        /*
         @Name              -> normalize
         @visibility        -> Private
         @Type              -> Recursive Method
         @Descripción       -> Fix .left and .right values of node.
         @parameters        -> tree: tree as JSON;
         @returns           -> Null
         @implemented by    -> deleteCategory(), treeMove();
         */
        var normalize = function(tree){

            /* (ES) es una función recursiva que recibe el árbol modificado por el usuario, al mover una categoría o nodo a otro lugar arrastrando y
            soltando (Drag and drop), se producen inconsistencia en los valores left y right, fix() se encarga de reescribir los valores left y right en el nuevo
            orden del árbol modificado, de forma sucesiva, adicionalmente se encarga de resolver una irregularidad del método tree('toJson'), el cual retorna el árbol
            desplegado en la vista para el momento, en este caso el modificado, donde si un nodo (padre) no tiene nodos dependientes (hijos), para el nodo (padre) no
            esta definido: node.children, por lo tanto es undefined (indefinido), si se detecta un nodo de este tipo se establece node.children = [];, lo que sería
            una definición más adecuada o conveniente para el programador.
            */

            var fix_count;

            var process = function(tree,parent_id){
                $(tree).each(function(index,node){

                    if(!fix_count){
                        fix_count = 1;
                    }

                    node.left = fix_count; fix_count +=1;

                    if(parent_id){
                        node.parent_id = parent_id;
                    }else{
                        node.parent_id = '';
                    }

                    if(node['children'] !== undefined && node['children'].length >= 1){
                        // hay nodos dependientes
                        process(node.children,node.id);
                    }else{
                        node.children = [];
                    }
                    node.right = fix_count; fix_count +=1;

                });
            };

            process(tree);

        };

        /*
         @Name              -> excludeNode
         @visibility        -> Private
         @Type              -> Recursive Method
         @Descripción       -> Exclude node delete.
         @parameters        -> tree: DOM tree as JSON; deleteCategoryId: id of node; deleteCategoryBranch: delete children nodes too;
         @returns           -> JSON; .target_tree: tree with node's excluded; .records_ids_for_delete: id of records for delete;
         @implemented by    -> deleteCategory()
         */
        var excludeNode = function(tree,deleteCategoryId,deleteCategoryBranch){

            var result = {
                'target_tree': [],
                'records_ids_for_delete':[]
            };

            var getRecordsIdsForDelete = function(deleteNode){

                var result = [];

                result.push(deleteNode.id);

                var process = function(node){

                    $(node).each(function(index,current_node){

                        result.push(current_node.id);

                        if(node['children'] !== undefined){
                            process(current_node.children);
                        }

                    });

                };

                process(deleteNode.children);

                return result;

            };

            var process = function(tree){
                $(tree).each(function(index,node){

                    if(node['id'] == deleteCategoryId){

                        if(node['children'] !== undefined){
                            if(deleteCategoryBranch == true){
                                // delete node and children
                               result.records_ids_for_delete = getRecordsIdsForDelete(node);
                            }else{
                                // Keep children
                                result.records_ids_for_delete.push(node['id']);

                                if(node.parent_id == ''){
                                    for(var i = 0; i < node.children.length; i++){
                                        node.children[i].parent_id = '';
                                    }
                                }else{
                                    for(var e = 0; e < node.children.length; e++){
                                        node.children[e].parent_id = node.parent_id;
                                    }
                                }

                                process(node.children);
                            }
                        }else{
                            result.records_ids_for_delete.push(node['id']);
                        }

                    }else{

                        var new_node = {
                            id:             node['id'],
                            parent_id:      node['parent_id'],
                            name:           node['name'],
                            left:           node['left'],
                            right:          node['right'],
                            children:       []
                        };

                        if(node.parent_id != ""){
                            // Is child node
                            // Función recursiva
                            insertChildNode(result['target_tree'],new_node);
                        }else{
                            // Is root node
                            // Se inserta el nodo directamente
                            result['target_tree'].push(new_node);
                        }

//                        result['target_tree'].push(new_node);

                        if(node['children'] !== undefined){
                            process(node.children);
                        }

                    }

                });
            };

            process(tree);

            return result;
        };

        /*
         @Name              -> deleteCategory
         @visibility        -> Private
         @Type              -> Method
         @Descripción       -> Delete a category.
         @parameters        -> null
         @returns           -> null
         @implemented by    -> categories.main()
         */
        var deleteCategory = function(){
            $("#delete-category").on('click',function(event){
                event.preventDefault();
                if(!$(this).hasClass("disabled")){
                    // Activamos el modal
                    $('#delete-category-modal').modal({"backdrop":false,"keyboard":true,"show":true,"remote":false}).on('hide.bs.modal',function(){
                        validate.removeValidationStates('category-delete-form');
                    });
                }
            });

            var notification;

            var request_parameters = {
                "requestType":"custom",
                "type":"post",
                "url":"/delete-category",
                "data":{},
                "callbacks":{
                    "beforeSend":function(){
                        notification = ajax.notification("beforeSend");
                    },
                    "success":function(response){

                        if(response['status']){
                            ajax.notification("success",notification);
                        }else{
                            ajax.notification("error",notification);
                        }

                        $('#delete-category-modal').modal('hide');
                        validate.removeValidationStates('category-delete-form');

                        if(response['tree'].length > 0){
                            // log
                            var jqTreeData = sourceDataAsJqTreeData(response.tree);
                            logSourceData(response);
                            logSourceDataAsJqTreeData(jqTreeData);
                            prettyPrint();


                            $('#no-tree').hide();
                            $('#tree').show();

                            var treeData = sourceDataAsJqTreeData(response['tree']);
                            replaceWholeTree(treeData)
                        }else{
                            $('#no-tree').show();
                            $('#tree').hide();
                            $('#log').hide();
                        }

                        var adminCategory = $("#admin-category");
                        adminCategory.find("button").each(function(k,element){
                            $(element).addClass("disabled");
                        });

                    },
                    "error":function(){
                        ajax.notification("error",notification);
                    },
                    "complete":function(response){}
                }
            };

            // validación:
            var validateObj = {
                "submitHandler": function(){

                    var deleteCategoryId        = $("#delete-category-id").val();
                    var deleteCategoryBranch    = $("#delete-category-branch").prop('checked');
                    var tree                    = JSON.parse(treeElement.tree('toJson'));

                    var excludeResult           = excludeNode(tree,deleteCategoryId,deleteCategoryBranch);

                    normalize(excludeResult['target_tree']);
                    var new_tree = prepare_for_data_store(excludeResult['target_tree']);

                    request_parameters.data = {
                        'tree':new_tree,
                        'records_ids_for_delete':excludeResult['records_ids_for_delete']
                    };

                    ajax.request(request_parameters);

                }
            };

            validate.form("category-delete-form",validateObj);

        };

        /*
         @Name              -> editCategoryName
         @visibility        -> Private
         @Type              -> Method
         @Descripción       -> Rename a category.
         @parameters        -> null
         @returns           -> null
         @implemented by    -> categories.main()
         */
        var editCategoryName = function(){
            $("#edit-category").on('click',function(event){
                event.preventDefault();
                if(!$(this).hasClass("disabled")){
                    // Activamos el modal
                    $('#edit-category-modal').modal({"backdrop":false,"keyboard":true,"show":true,"remote":false}).on('hide.bs.modal',function(){
                    });
                }
            });

            var notification;

            var request_parameters = {
                "requestType":"form",
                "type":"post",
                "url":"/edit-category",
                "data":{},
                "form":{
                    "id":"category-edit-form",
                    "inputs":[
                        {'id':'edit-category-id', 'name':'id'},
                        {'id':'edit-category-name', 'name':'name'}
                    ]
                },
                "callbacks":{
                    "beforeSend":function(){
                        notification = ajax.notification("beforeSend");
                    },
                    "success":function(response){

                        var form = $("#category-edit-form");

                        if(response['status']){
                            ajax.notification("success",notification);

                            form.find(".alert-success").fadeIn();

                            setTimeout(function(){
                                $("#category-edit-form").find(".alert-success").fadeOut();
                            },2000);

                        }else{
                            ajax.notification("error",notification);

                            form.find(".alert-danger").fadeIn();
                            form.find(".modal-body").find(".form-group").hide();
                            form.find(".modal-footer").hide();

                            setTimeout(function(){
                                $('#edit-category-modal').modal('hide');
                                validate.removeValidationStates('category-edit-form');

                                var form = $("#category-edit-form");

                                form.find(".alert-danger").fadeOut();
                                form.find(".modal-body").find(".form-group").show();
                                form.find(".modal-footer").show();

                            },3000);
                        }

                        if(response['tree'].length > 0){
                            // log
                            var jqTreeData = sourceDataAsJqTreeData(response.tree);
                            logSourceData(response);
                            logSourceDataAsJqTreeData(jqTreeData);
                            prettyPrint();


                            $('#no-tree').hide();
                            $('#tree').show();

                            var treeData = sourceDataAsJqTreeData(response['tree']);
                            replaceWholeTree(treeData)
                        }else{
                            $('#no-tree').show();
                            $('#tree').hide();
                        }

                        var adminCategory = $("#admin-category");
                        adminCategory.find("button").each(function(k,element){
                            $(element).addClass("disabled");
                        });

                    },
                    "error":function(){
                        ajax.notification("error",notification);
                    },
                    "complete":function(response){}
                }
            };

            // validación:
            var validateObj = {
                "submitHandler": function(){
                    ajax.request(request_parameters);
                },
                "rules":{
                    "edit-category-name":{
                        "required":true,
                        "maxlength":20
                    }
                },
                "messages":{
                    "edit-category-name":{
                        "required":"El campo nombre es obligatorio.",
                        "maxlength":"El nombre de la categoría no debe tener mas de 20 caracteres."
                    }
                }
            };

            validate.form("category-edit-form",validateObj);

        };

        /*
         @Name              -> treeMove
         @visibility        -> Private
         @Type              -> Event
         @Descripción       -> Update tree after move one o more node's. Change left and right values and if is necessary parent_id too.
         @parameters        -> null
         @returns           -> null
         @implemented by    -> categories.main()
         */
        var treeMove = function(){

            var notification;

            var request_parameters = {
                "requestType":"custom",
                "type":"post",
                "url":"/update-tree",
                "data":{},
                "callbacks":{
                    "beforeSend":function(){
                        notification = ajax.notification("beforeSend");
                    },
                    "success":function(response){

                        if(response['status']){
                            ajax.notification("success",notification);
                        }else{
                            ajax.notification("error",notification);
                        }

                        if(response['tree'].length > 0){
                            // log
                            var jqTreeData = sourceDataAsJqTreeData(response.tree);
                            logSourceData(response);
                            logSourceDataAsJqTreeData(jqTreeData);
                            prettyPrint();


                            $('#no-tree').hide();
                            $('#tree').show();

                            var treeData = sourceDataAsJqTreeData(response['tree']);
                            replaceWholeTree(treeData)
                        }else{
                            $('#no-tree').show();
                            $('#tree').hide();
                        }

                    },
                    "error":function(){
                        ajax.notification("error",notification);
                    },
                    "complete":function(response){}
                }
            };

            treeElement.bind('tree.move',function(event) {

                var adminCategory = $("#admin-category");
                adminCategory.find("button").each(function(k,element){
                    $(element).addClass("disabled");
                });

                event.preventDefault();
                event.move_info.do_move();

                var tree = JSON.parse(treeElement.tree('toJson'));

                normalize(tree);

                var new_tree = prepare_for_data_store(tree);

                request_parameters['data'] = {
                    'tree':new_tree
                };

                ajax.request(request_parameters);

            });

        };

        /*
         @Name              -> newCategory
         @visibility        -> Private
         @Type              -> Method
         @Descripción       -> Add a new category.
         @parameters        -> null
         @returns           -> null
         @implemented by    -> categories.main()
         */
        var newCategory = function(){
            $(".new-category").on('click',function(event){
                event.preventDefault();
                $('#new-category-modal').modal({"backdrop":false,"keyboard":true,"show":true,"remote":false}).on('hide.bs.modal',function(){
                    validate.removeValidationStates('category-add-form');
                });
            });

            var notification;

            var request_parameters = {
                "requestType":"form",
                "type":"post",
                "url":"/new-category",
                "data":{},
                "form":{
                    "id":"category-add-form",
                    "inputs":[
                        {'id':'category-name', 'name':'name'}
                    ]
                },
                "callbacks":{
                    "beforeSend":function(){
                        notification = ajax.notification("beforeSend");
                    },
                    "success":function(response){

                        var form = $("#category-add-form");

                        if(response['status']){
                            ajax.notification("success",notification);

                            form.find(".alert-success").fadeIn();
                            validate.removeValidationStates('category-add-form');

                            setTimeout(function(){
                                $("#category-add-form").find(".alert-success").fadeOut();
                            },2000);

                        }else{
                            ajax.notification("error",notification);

                            form.find(".alert-danger").fadeIn();
                            form.find(".modal-body").find(".form-group").hide();
                            form.find(".modal-footer").hide();

                            setTimeout(function(){
                                $('#new-category-modal').modal('hide');
                                validate.removeValidationStates('category-add-form');

                                var form = $("#category-add-form");
                                form.find(".alert-danger").fadeOut();
                                form.find(".modal-body").find(".form-group").show();
                                form.find(".modal-footer").show();

                            },3000);
                        }

                        if(response['tree'].length > 0){

                            var jqTreeData = sourceDataAsJqTreeData(response.tree);

                            // log
                            logSourceData(response);
                            logSourceDataAsJqTreeData(jqTreeData);
                            prettyPrint();

                            $('#no-tree').hide();
                            $('#tree').show();
                            $('#log').show();

                            if(initEstate == 0){
                                displayJqTreeData(jqTreeData);
                                initEstate = 1;
                            }else{
                                replaceWholeTree(jqTreeData);
                            }


                        }else{
                            $('#no-tree').show();
                            $('#tree').hide();
                        }

                    },
                    "error":function(){
                        ajax.notification("error",notification);
                    },
                    "complete":function(response){}
                }
            };

            // validación:
            var validateObj = {
                "submitHandler": function(){
                    ajax.request(request_parameters);
                },
                "rules":{
                    "category-name":{
                        "required":true,
                        "maxlength":50
                    }
                },
                "messages":{
                    "category-name":{
                        "required":"El campo nombre es obligatorio.",
                        "maxlength":"El nombre de la categoría no debe tener mas de 50 caracteres."
                    }
                }
            };

            validate.form("category-add-form",validateObj);
        };

        /*
         @Name              -> treeSelect
         @visibility        -> Private
         @Type              -> Event
         @Descripción       -> Event firing after selecting a category.
         @parameters        -> null
         @returns           -> null
         @implemented by    -> categories.main()
         */
        var treeSelect = function(){
            treeElement.bind(
                'tree.select',
                function(event) {

                    var adminCategory = $("#admin-category");

                    if (event.node) {

                        //  EDIT
                        $("#edit-category-id").val(event['node']['id']);
                        $("#edit-category-name").val(event['node']['name']);

                        //  Delete
                        $("#delete-category-id").val(event['node']['id']);
                        $("#delete-category-name").text(event['node']['name']);

                        if(event['node']['children'].length > 0){
                            $("#delete-category-branch").parents(".form-group").show();
                        }else{
                            $("#delete-category-branch").parents(".form-group").hide();
                        }

                        // Habilita los botones.
                        adminCategory.find("button").each(function(k,element){
                            $(element).removeClass("disabled");
                        });
                    }else {
                        // inhabilita los botones.
                        adminCategory.find("button").each(function(k,element){
                            $(element).addClass("disabled");
                        });
                    }

                }
            );
        };

        /*
         @Name              -> getTree
         @visibility        -> Private
         @Type              -> Method
         @Descripción       -> Make Http request to get source data for bootstrap the tree.
         @parameters        -> null
         @returns           -> null
         @implemented by    -> categories.main()
        */
        var getTree = function(){

            var request_parameters = {
                "requestType":"custom",
                "type":"post",
                "url":"/get-tree",
                "data":{},
                "callbacks":{
                    "beforeSend":function(){},
                    "success":function(response){

                        initEstate = response.length;

                        if(response.length > 0){

                            var jqTreeData = sourceDataAsJqTreeData(response);

                            displayJqTreeData(jqTreeData);

                            // log
                            logSourceData(response);
                            logSourceDataAsJqTreeData(jqTreeData);
                            prettyPrint();


                            $('#no-tree').hide();
                            $('#tree').show();
                            $('#log').show();
                        }else{
                            $('#tree').hide();
                            $('#log').hide();
                            $('#no-tree').show();
                        }

                    },
                    "error":function(){},
                    "complete":function(){}
                }
            };

            ajax.request(request_parameters);
        };

        /*
         @Name              -> main
         @visibility        -> Public
         @Type              -> Method
         @Descripción       -> Main, Like Java Main Method.
         @parameters        -> null
         @returns           -> null
         @implemented by    -> CLIENT
         */
        categories.main = function(){

            treeElement = $('#display-tree');
            getTree();

            treeSelect(); // event
            treeMove(); // event

            newCategory();
            editCategoryName();
            deleteCategory();

        };

    }( window.categories = window.categories || {}, jQuery ));

    categories.main();

});