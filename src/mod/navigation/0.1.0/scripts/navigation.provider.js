navigationMod.provider('$navigationMod',function () {
    var self = this;
    this.params = null;
    this.config = function (params) {
        this.params = params;
    };
    this.$get = function (navigationModConfig) {
        if(self.params===null){
            self.params = navigationModConfig;
        }
        return {
            config: function () {
                return self.params;
            }
        };
    };
    this.$get.$inject = ['navigationModConfig'];
});
