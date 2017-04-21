//enable deepRedirect
$provide.decorator("$state", ["$delegate", function $transitionToDecorator($delegate) {
    var origTransitionTo = $delegate.transitionTo;
    $delegate.transitionTo = function (to, toParams, options) {
        StateMap = $delegate.router.stateRegistry.states;
        var stateName = (to && to.name) || to; //extract state name
        var stateObject = StateMap[stateName] && StateMap[stateName].self; //get state object by stateName (StateMap property names are the same for each state name)
        var isChildOfDeepRedirect = stateObject && stateObject.parent && StateMap[stateObject.parent] && StateMap[stateObject.parent].self && StateMap[stateObject.parent].self.deepRedirect;
        var isDeepRedirect = stateObject && stateObject.deepRedirect;

        if(isChildOfDeepRedirect || isDeepRedirect) {
            if(options) { options.inherit = true; } //inherit url parameters from current url
            if(isChildOfDeepRedirect) { //if state has parent and parent has deepRedirect (ie, it is a child of an abstract state with deepRedirect)
                StateMap[stateObject.parent].self.previousSubState = stateObject.name; //then save this child (sub) state object to parent
                StateMap[stateObject.parent].self.previousSubStateParams = toParams;
            } else if(isDeepRedirect && stateObject.previousSubState) { //if state has deepRedirect (ie, is a parent state) and a previous sub state exists
                to = stateObject.previousSubState; //then we can auto-redirect to the sub state
                if(!toParams) { //if no current params exist, set toParams to previous state's previous params
                    toParams = stateObject.previousSubStateParams || null;
                }
            }
        }
        return origTransitionTo.apply($delegate, arguments); //arguments contains {state, params, options} and are passed to the original transitionTo function
    };
    return $delegate;
}]);
