footerMod.provider('$footerMod', function () {
    var self = this;
    this.params = null;
    this.config = function (params) {
        this.params = params;
    };
    this.$get = function (footerModConfig) {
        if(self.params===null){
            self.params = footerModConfig;
        }
        return {
            config: function () {
                return self.params;
            }
        };
    };
    this.$get.$inject = ['footerModConfig'];
});

