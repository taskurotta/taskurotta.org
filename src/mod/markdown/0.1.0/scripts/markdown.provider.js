markdownMod.provider('$markdownMod', function() {
        var converter = new Showdown.converter();
        this.params = null;
        this.config = function (params) {
            this.params = params;
        };
        this.$get = function(markdownModConfig,$http) {
            var params = (this.params!==null)?this.params:markdownModConfig;
            return {
                config: function(){
                    return params;
                },
                markup: function (text){
                    return converter.makeHtml(text);
                },
                load: function (source,callback){
                    if(source){
                        $http({ url: source,  method: 'GET' })
                            .success(function (text) {
                                callback(converter.makeHtml(text));
                            });
                    }
                }
            };
        };
        this.$get.$inject = ['markdownModConfig','$http'];
    });