<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page session="false" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>JqTree, Spring MVC, GoogleAppEngine; Example:</title>

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="<c:url value="/favicon.ico" />">

    <!-- Bootstrap -->
    <link rel="stylesheet" media="screen" href="<c:url value="/resources/library-vendor/bootstrap/css/bootstrap.min.css" />" >

    <!-- Normalize  for improved cross-browser rendering -->
    <link rel="stylesheet" href="<c:url value="/resources/library-vendor/normalize/normalize.css" />" >

    <!-- Google Code Prettify -->
    <link rel="stylesheet" href="<c:url value="/resources/library-vendor/google-code-prettify/prettify.css" />">
    <link rel="stylesheet" href="<c:url value="/resources/library-vendor/google-code-prettify/desert.css" />">

    <!-- jqTree -->
    <link rel="stylesheet" href="<c:url value="/resources/library-vendor/jqTree-master/jqtree.css" />">

    <!-- Pnotify - pinesframework  -->
    <link rel="stylesheet" href="<c:url value="/resources/library-vendor/pnotify/pnotify.custom.min.css" />">

    <style>
        body {
            padding-top: 50px;
        }
        .main-container {
            padding: 40px 15px;
        }

        .pull-left {
            float: left !important;
        }
        .pull-right {
            float: right !important;
        }

        /* tree  */
        ul.jqtree-tree .jqtree-element {
            position: relative;

            /* Store - new css */
            padding: 7px;
            border-radius: 4px;
        }

        ul.jqtree-tree li {
            /* Store - new css */
            border: 1px solid #143546;
            margin: 7px;
            border-radius: 4px;
        }
        ul.jqtree-tree span.jqtree-border {
            /* Store - new css */
            padding: 7px;
            border-radius: 4px;
        }
        /* tree ends */
    </style>

</head>
<body>


<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
    <a href="https://github.com/romelgomez/jqtree-spring-mvc-gae-example"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png"></a>
    <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="/">JqTree, Spring MVC, GoogleAppEngine; Example:</a>
    </div>
</div>

<div class="main-container">
    <div class="container-fluid">

        <!-- tree -->
        <div class="row">
            <div class="col-xs-12">

                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h3 class="panel-title">Main technologies implemented:</h3>
                    </div>
                    <div class="panel-body">
                        <ul>
                            <li>jqTree <a href="http://mbraak.github.io/jqTree/">http://mbraak.github.io/jqTree/</a></li>
                            <li>Spring MVC <a href="http://projects.spring.io/spring-framework/">http://projects.spring.io/spring-framework/</a></li>
                            <li>Google App Engine API <a href="https://developers.google.com/appengine/docs/java/">https://developers.google.com/appengine/docs/java/</a></li>
                        </ul>
                    </div>
                </div>



                <!-- Tree -->
                <div id="tree" style="display:none;" >

                    <!-- controles -->
                    <div class="row">
                        <div class="col-xs-12">


                            <div class="panel panel-default">
                                <div class="panel-heading">
                                    <h3 class="panel-title">Categories:</h3>
                                </div>
                                <div class="panel-body">

                                    <div class="btn-toolbar" role="toolbar">
                                        <div id="admin-category" class="btn-group">
                                            <button id="edit-category" type="button" class="btn btn-default disabled">Edit</button>
                                            <button id="delete-category"  type="button" class="btn btn-default disabled">Delete</button>
                                        </div>
                                        <div class="btn-group">
                                            <button type="button" class="btn btn-primary new-category">Add a new category!</button>
                                        </div>
                                    </div>

                                    <h4 class="page-header">Instructions:</h4>

                                    <strong>To change the position: </strong> Drag and drop category or node.<br>
                                    <strong>To edit or delete:</strong> Select the category and then select the action.

                                    <h4 class="page-header">Categories:</h4>

                                    <div id="display-tree"></div>

                                </div>
                            </div>

                        </div>
                    </div>



                </div>
                <!-- no Tree -->
                <div id="no-tree" style="display:none;">
                    <div class="alert alert-info" role="alert">
                        <strong>Alerta!</strong> no categories loaded yet. <a class="new-category" href="#"><strong>Add a new category!</strong></a>
                    </div>
                </div>

            </div>
        </div>

        <!-- log -->
        <section id="log">
            <div class="row">
                <div class="col-xs-12">
                    <h2 style="margin-top: 0;">Log source data:</h2>
                    <div id="source-data"></div>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-12">
                    <h2 style="margin-top: 0;">Log source data as JqTree Data:</h2>
                    <div id="source-data-as-jqtree-data"></div>
                </div>
            </div>
        </section>

    </div>
</div>

<!-- Footer -->
<div id="footer" style="margin-bottom: 20px">
    <div style="text-align: center;">
        MIT License
    </div>
</div>



<!-- Modal New Category -->
<div class="modal fade" id="new-category-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form role="form" id="category-add-form" action="#" method="post" accept-charset="utf-8">

                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                    <h4 class="modal-title">New Category</h4>
                </div>

                <div class="modal-body">

                    <!-- Mensajes post ajax request -->
                    <div class="alert alert-success alert-dismissible" style="display: none;" role="alert">
                        <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        You have registered the category!
                    </div>
                    <div class="alert alert-danger alert-dismissible" style="display: none;" role="alert">
                        <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        An error has occurred, try again or you can also try reloading the page if the error persists!
                    </div>

                    <div class="form-group">
                        <label for="category-name"><span class="glyphicon glyphicon-folder-close"></span> Name</label>
                        <input type="text" class="form-control" id="category-name" name="category-name" placeholder="Eje: Laptops">
                        <span class="help-block" style="display: none;">Requerido</span>
                    </div>

                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Send</button>
                </div>

            </form>
        </div>
    </div>
</div>

<!-- Modal to edit the category name -->
<div class="modal fade" id="edit-category-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form role="form" id="category-edit-form" action="#" method="post" accept-charset="utf-8">

                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                    <h4 class="modal-title">Edit the category name</h4>
                </div>

                <div class="modal-body">

                    <!-- Mensajes post ajax request -->
                    <div class="alert alert-success alert-dismissible" style="display: none;" role="alert">
                        <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        Category has been edited!
                    </div>
                    <div class="alert alert-danger alert-dismissible" style="display: none;" role="alert">
                        <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        An error has occurred, try again or you can also try reloading the page if the error persists!
                    </div>

                    <input type="hidden" id="edit-category-id" name="edit-category-id">

                    <div class="form-group">
                        <label for="edit-category-name"><span class="glyphicon glyphicon-folder-close"></span> Nombre</label>
                        <input type="text" class="form-control" id="edit-category-name" name="edit-category-name" placeholder="Eje: Laptops">
                        <span class="help-block" style="display: none;">Requerido</span>
                    </div>

                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Update</button>
                </div>

            </form>
        </div>
    </div>
</div>

<!-- Modal to delete the category -->
<div class="modal fade" id="delete-category-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form role="form" id="category-delete-form" action="#" method="post" accept-charset="utf-8">

                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Cerrar</span></button>
                    <h4 class="modal-title">Do you really want to delete this category?</h4>
                </div>

                <div class="modal-body">
                    <input type="hidden" id="delete-category-id" name="delete-category-id">

                    <h3 class="text-danger" id="delete-category-name" style="margin-top: 0; margin-bottom: 0;"></h3>

                    <div class="form-group">
                        <div class="checkbox">
                            <label>
                                <input id="delete-category-branch" type="checkbox"> And daughters categories also
                            </label>
                        </div>
                    </div>

                </div>

                <div class="modal-footer" style="margin-top: 0;">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger">Confirm</button>
                </div>

            </form>
        </div>
    </div>
</div>



<!-- JavaScripts -->
<section>

    <!-- jQuery Core -->
    <script src="<c:url value="/resources/library-vendor/jquery/jquery-2.0.3.min.js" />"></script>

    <!-- jQuery Validation -->
    <script src="<c:url value="/resources/library-vendor/jquery/validation/jquery.validate.min.js" />"  type="text/javascript" ></script>

    <!-- jQuery Validation Additional Methods -->
    <script src="<c:url value="/resources/library-vendor/jquery/validation/additional-methods.min.js" />"  type="text/javascript" ></script>

    <!-- Bootstrap -->
    <script src="<c:url value="/resources/library-vendor/bootstrap/js/bootstrap.min.js" />" type="text/javascript"></script>

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries, (https://github.com/scottjehl/Respond), (https://code.google.com/p/html5shiv/) -->
    <script src="<c:url value="/resources/library-vendor/respond/respond.min.js" />" type="text/javascript"></script>
    <script src="<c:url value="/resources/library-vendor/html5shiv/html5shiv.js" />" type="text/javascript"></script>

    <!-- Google Code Prettify -->
    <script src="<c:url value="/resources/library-vendor/google-code-prettify/prettify.js" />" type="text/javascript"></script>

    <!-- jqTree  -->
    <script src="<c:url value="/resources/library-vendor/jqTree-master/tree.jquery.js" />"  type="text/javascript" ></script>

    <!-- Cookie Jquery  -->
    <script src="<c:url value="/resources/library-vendor/jquery-cookie-master/jquery.cookie.js" />"  type="text/javascript" ></script>

    <!-- Pnotify - pinesframework  -->
    <script src="<c:url value="/resources/library-vendor/pnotify/pnotify.custom.min.js" />"  type="text/javascript" ></script>

    <!-- App Base -->
    <script src="<c:url value="/resources/app/js/app.js" />"  type="text/javascript" ></script>

    <!-- App -->
    <script src="<c:url value="/resources/app/js/categories/app.categories.js" />"  type="text/javascript" ></script>


</section>

</body>
</html>