/**
 * taskurotta.org - v0.0.1 - 2013-09-23
 * 
 */
/**
 * Created by Zakirov.RR on 05.08.13.
 */
describe('Get started app tests ',function(){
    var compile = null;
    var rootScope = null;
    beforeEach(module('get_started'));
    beforeEach(inject(function($compile,$rootScope){
        compile = $compile;
        rootScope = $rootScope;
    }));
    it('Loaded get started page',function(){
        expect(2+2).toBe(4);
    });

});