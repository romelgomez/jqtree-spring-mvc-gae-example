//  Javascript Namespace Declaration: http://stackoverflow.com/questions/881515/javascript-namespace-declaration
//  http://appendto.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/
//
//(function( skillet, $, undefined ) {
//    //Private Property
//    var isHot = true;
//
//    //Public Property
//    skillet.ingredient = "Bacon Strips";
//
//    //Public Method
//    skillet.fry = function() {
//        var oliveOil;
//
//        addItem( "\t\n Butter \n\t" );
//        addItem( oliveOil );
//        console.log( "Frying " + skillet.ingredient );
//    };
//
//    //Private Method
//    function addItem( item ) {
//        if ( item !== undefined ) {
//            console.log( "Adding " + $.trim(item) );
//        }
//    }
//}( window.skillet = window.skillet || {}, jQuery ));


/*
 @Name              -> ajax
 @Type              -> NameSpace
 @Descripción       -> NameSpace for ajax requests methods
*/
(function( ajax, $, undefined ) {

    /*
     @Name              -> getFormData
     @visibility        -> Private
     @Type              -> Method
     @Descripción       -> Get values of form inputs.
     @parameters        -> parameters: Array of objects, each object have two pairs, id: Id of input, name: Name of input;
     @returns           -> Object
     @implemented by    -> ajax.request()
     */
    var getFormData = function(parameters){
        /*
         obj = {};

         var input_ids = [{"id":"a","name":"a"},{"id":"b","name":"b"},{"id":"c","name":"c"}];

         $.each(input_ids,function(index,input){
         obj[input.name] = $('#'+input.id).val();
         });

         console.log(obj)
         */

        var data = {};
        $.each(parameters['form']['inputs'],function(index,input){
            data[input['name']] = $('#'+input['id']).val();
        });
        return data;
    };

    /*
     @Name              -> request
     @visibility        -> Private
     @Type              -> Method
     @Descripción       -> make ajax request.
     @parameters        -> parameters: JSON object with several directives.
     @returns           -> null
     */
    var request = function(parameters){
        var ajax_request_parameters = {
            "type": parameters['type'],
            "url": parameters['url'],
            "contentType": "application/json; charset=UTF-8",
            "dataType": 'json',
            "data": JSON.stringify(parameters['data']),
            "global": false,
            "beforeSend":function(){
                parameters['callbacks']['beforeSend']();
            },
            "success":function(response){
                parameters['callbacks']['success'](response);
            },
            "error":function(response){
                parameters['callbacks']['error'](response);
            },
            "complete":function(response){
                parameters['callbacks']['complete'](response);
            }
        };

        $.ajax(ajax_request_parameters);
    };

    /*
     @Name              -> notification
     @visibility        -> Public
     @Type              -> Method
     @Descripción       -> notifies the status of ajax request.
     */
    ajax.notification = function(event,notification,options){

        var defaultOptions = {
            'init' : {
                'title':    'Processing',
                'text' :    'Wait a moment while we process your request.',
                'type':     'info',
                'icon':     'fa fa-spinner fa-spin',
                'hide':     false,
                'closer':   false,
                'sticker':  false,
                'opacity':  .75,
                'shadow':   false,
                'history':  false
            },
            'success' : {
                'title':    'Ready!',
                'text' :    'Your request has been processed successfully.',
                'type':     'success',
                'hide':     true,
                'closer':   true,
                'sticker':  true,
                'icon':     'glyphicon glyphicon-ok-sign',
                'opacity':  1,
                'shadow':   true,
                'history':  true
            },
            'error': {
                'title':    'Error!',
                'text' :    'An error has occurred while processing your request.',
                'type' :    'error',
                'icon':     'glyphicon glyphicon-warning-sign',
                'hide':     true,
                'closer':   true,
                'sticker':  true,
                'opacity':  1,
                'shadow':   true,
                'history':  true
            }
        };

        // beforeSend, success, error, complete

        if(event == "beforeSend"){
            var notice;
            if ( options !== undefined ) {
                notice = new PNotify(options);
            }else{
                notice = new PNotify(defaultOptions['init']);
            }
        }

        if(event == "success"){
            if ( options !== undefined ) {
                notification.update(options);
            }else{
                notification.update(defaultOptions['success']);
            }
        }
        if(event == "error"){
            if ( options !== undefined ) {
                notification.update(options);
            }else{
                notification.update(defaultOptions['error']);
            }
        }
        if(event == "complete"){
            notification.remove();
        }

        return notice;
    };

    /*
     @Name              -> request
     @visibility        -> Public
     @Type              -> Method
     @Descripción       -> define what type request is.
     @parameters        -> parameters: JSON object; .requestType is one string, can be 'form' or 'custom', form means is need one more step before make ajax request, which is get values of form inputs; custom means it ready to make ajax request.
     @returns           -> null
     */
    ajax.request = function(parameters){
        if(parameters !== undefined){
            if(parameters['requestType'] == 'form'){
                parameters['data'] = getFormData(parameters);
                request(parameters);
            }
            if(parameters['requestType'] == "custom"){
                request(parameters);
            }
        }
    };

}( window.ajax = window.ajax || {}, jQuery ));

/*
 @Name              -> validate
 @Type              -> NameSpace
 @Descripción       -> NameSpace for form validation methods, more info about this check this web site: http://jqueryvalidation.org/
 */
(function( validate, $) {

    $.validator.addMethod("noSpecialChars", function(value, element) {
        return this.optional(element) || /^[a-z0-9\x20]+$/i.test(value);
    }, "Username must contain only letters, numbers, or underscore.");

    /*
     @Name              -> validationStates
     @visibility        -> Private
     @Type              -> Property
     @Descripción       -> validation States class in bootstrap
     */
    var validationStates = ['has-success','has-warning','has-error'];

    /*
     @Name              -> inlineForm
     @visibility        -> Public
     @Type              -> Method
     @Descripción       -> Using when is about inline form and it no show any error message.
     @parameters        -> formId: string, id of form; options: json object, several directives.
     @returns           -> null
     */
    validate.inlineForm = function(formId,options){

        options.errorPlacement = function(error, element){};

        options.success = function(label){};

        options.highlight = function(element){
            $(validationStates).each(function(k2,state){
                if($(element).parents('.form-group').hasClass(state)){
                    $(element).parents('.form-group').removeClass(state);
                }
            });
            $(element).parents('.form-group').addClass('has-warning');
        };

        options.unhighlight = function(element){
            $(validationStates).each(function(k2,state){
                if($(element).parents('.form-group').hasClass(state)){
                    $(element).parents('.form-group').removeClass(state);
                }
            });
            $(element).parents('.form-group').addClass('has-success');
        };

        $("#"+formId).validate(options);

    };

    /*
     @Name              -> form
     @visibility        -> Public
     @Type              -> Method
     @Descripción       -> Using when is about regular form and it show error message.
     @parameters        -> formId: string, id of form; options: json object, several directives.
     @returns           -> null
     */
    validate.form = function(formId,options){

        options.errorPlacement = function(error, element){
            $(element).parents('.form-group').find(".help-block").fadeIn().html($(error).html());
        };

        options.success = function(label){
        };

        options.highlight = function(element){
            $(validationStates).each(function(k2,state){
                if($(element).parents('.form-group').hasClass(state)){
                    $(element).parents('.form-group').removeClass(state);
                }
            });
            $(element).parents('.form-group').addClass('has-warning');
        };

        options.unhighlight = function(element){
            $(validationStates).each(function(k2,state){
                if($(element).parents('.form-group').hasClass(state)){
                    $(element).parents('.form-group').removeClass(state);
                }
            });
            $(element).parents('.form-group').addClass('has-success');
        };

        $("#"+formId).validate(options);

    };

    /*
     @Name              -> removeValidationStates
     @visibility        -> Public
     @Type              -> Method
     @Descripción       -> (EN) Using for renew form; (ES) Renueva el formulario y remueve los estados de validación
     @parameters        -> formId: string, id of form.
     @returns           -> null
     */
    validate.removeValidationStates = function(formId){
        var form = $('#'+formId);

        form[0].reset();

        $(':input',form)
            .not(':button, :submit, :reset, :hidden')
            .val('')
            .removeAttr('checked')
            .removeAttr('selected');

        var inputs = form.find('input');
        inputs.each(function(inputKey,_input_){
            var input = $(_input_);
            $(validationStates).each(function(stateKey,state){
                if(input.parents('.form-group').hasClass(state)){
                    input.parents('.form-group').removeClass(state);
                    input.parents('.form-group').find(".help-block").fadeOut();
                }
            });
        });
    };



}( window.validate = window.validate || {}, jQuery ));

/*
 @Name              -> utility
 @Type              -> NameSpace
 @Descripción       -> NameSpace for utilities methods
 */
(function( utility){

    utility.randomNumber = function(inferior,superior){
        var numPosibilidades = superior - inferior;
        var aleatory = Math.random() * numPosibilidades;
        aleatory = Math.round(aleatory);
        return parseInt(inferior) + aleatory;
    };

    utility.capitaliseFirstLetter = function(string){ return string.charAt(0).toUpperCase() + string.slice(1); };

    utility.stringReplace = function(string, change_this, for_this) {
        return string.split(change_this).join(for_this);
    };

    utility.removeCommentTag = function(data){
        var face_1 = utility.stringReplace(data,'<!--','');
        return utility.stringReplace(face_1,'-->','');
    };

}( window.utility = window.utility || {}, jQuery ));