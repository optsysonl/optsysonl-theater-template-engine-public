define([], function () {
    window.RoutesHelper = (function () {
        function addSharedRoutes(isMobile) {
            this.route("theaters", "theaters");
            this.route("theater/:id", isMobile ? "theaterDetails" : "theater");
            this.route("movies", isMobile ? "listMovies" : "movies");
            this.route("movie/:featureCode/:theaterId", isMobile ? "movieDetails" : "movie");
            this.route("tickets/:pPerformance/:pMovie/:pTheater/:onHoldConfirmationNumber/:facebookId", isMobile ? "selectTickets" : "checkout");
            this.route("tickets/:pPerformance/:pMovie/:pTheater/:onHoldConfirmationNumber", isMobile ? "selectTickets" : "checkout");
            this.route("tickets/:pPerformance/:pMovie/:pTheater/?utm_source=google&utm_campaign=webedia&utm_medium=organic", isMobile ? "selectTickets" : "checkout");
            this.route("tickets/:pPerformance/:pMovie/:pTheater", isMobile ? "selectTickets" : "checkout");
        }

        return {
            addSharedRoutes: addSharedRoutes
        };
    });
})