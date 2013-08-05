markdownMod.provider('$markdownMod', function() {
    console.log('markdownMod.provider');
        var converter = new Showdown.converter();
        var self = this;
        this.params = null;
        this.config = function (params) {
            this.params = params;
        };
        this.$get = function(markdownModConfig,$http) {
            console.log('markdownMod.provider.$get');
            if(self.params===null){
                self.params = markdownModConfig;
            }
            return {
                config: function(){
                    return self.params;
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