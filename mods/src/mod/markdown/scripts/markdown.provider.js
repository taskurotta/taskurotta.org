angular.module('markdownModProvider', ['coreMod'])
    .provider('markdownMod', function () {
        console.log('markdownMod.provider');
        var converter = new Showdown.converter();
        this.path = '/';
        this.src = null;
        this.setBasePath = function (path) {
            this.params = path;
        };
        this.setSource = function (src) {
            this.src = src;
        };
        this.$get = function ($log, $http) {
            $log.log('markdownMod.provider.$get');
            var self = this;
            return {
                getBasePath: function () {
                    return self.path;
                },
                getSource: function () {
                    return self.src;
                },
                markup: function (text) {
                    return converter.makeHtml(text);
                },
                load: function (source, callback) {
                    if (source) {
                        $http({ url: source, method: 'GET' })
                            .success(function (text) {
                                $log.log('markdown file loaded');
                                callback(converter.makeHtml(text));
                            });
                    }
                }
            };
        };
        this.$get.$inject = ['$log', '$http'];
    });