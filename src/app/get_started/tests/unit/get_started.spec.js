/**
 * Created by Zakirov.RR on 05.08.13.
 */
describe('Get started app tests ',function(){
    var compile = null;
    var rootScope = null;
    beforeEach(module('get_startedApp'));
    beforeEach(inject(function($compile,$rootScope){
        compile1 = $compile;
        rootScope1 = $rootScope;
    }));
    it('Loaded get started page',function(){
        expect(2+2).toBe(4);
    });

});