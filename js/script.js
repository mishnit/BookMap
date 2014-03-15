function checkRequirements()
{
    if (navigator.connection.type == Connection.NONE)
    {
        navigator.notification.alert(
            'To use this app you must enable your internet connection',
            function(){},
            'Warning'
        );
        return false;
    }

    return true;
}

function getUrlParameterValue(parameter)
{
    var results = new RegExp('[\\?&]' + parameter + '=([^&#]*)').exec(window.location.href);
    if (results != null && typeof results[1] !== 'undefined')
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    else
        return null;
}

function getRealMapHeight() 
{
    var header = $.mobile.pageContainer.pagecontainer('getActivePage').find("div[data-role='header']:visible");
    var footer = $.mobile.pageContainer.pagecontainer('getActivePage').find("div[data-role='footer']:visible");
    var content = $.mobile.pageContainer.pagecontainer('getActivePage').find("div[class='ui-content']:visible:visible");
    var grid = $.mobile.pageContainer.pagecontainer('getActivePage').find("div[class='ui-grid-a']:visible");
    var viewportHeight = $(window).height();

    var mapHeight = viewportHeight - (header.outerHeight(true) + footer.outerHeight() + grid.outerHeight());
    
    mapHeight -= (content.outerHeight() - content.height());

    return mapHeight;
}

function initializeApplication()
{
    $('#bm-home-map-canvas').height(getRealMapHeight());
    
    navigator.geolocation.watchPosition(
        function(location)
        {
            Map.displayMap(location, null, 'bm-home-map-canvas');
        },
        function(){},
        {enableHighAccuracy: true}
    );
    
    $(document).on(
        'pageshow',
        '#bm-home-page',
        function()
        {
            $('#bm-home-map-canvas').height(getRealMapHeight());
    
            navigator.geolocation.watchPosition(
                function(location)
                {
                    Map.displayMap(location, null, 'bm-home-map-canvas');
                },
                function(){},
                {enableHighAccuracy: true}
            );
        }
    );
    
    $('#bm-save-btn').click(function() {
        if (checkRequirements() === false)
        {
            $(this).removeClass('ui-btn-active');
            return false;
        }
    });
    
    $(document).on(
        'pageshow',
        '#bm-map-page',
        function()
        {
            var requestType = getUrlParameterValue('requestType');
            var positionIndex = getUrlParameterValue('index');
            var positionName = getUrlParameterValue('name');
            var geolocationOptions = {
                timeout: 15000,
                maximumAge: 10000,
                enableHighAccuracy: true
            };
            var position = new Position();

            $.mobile.loading('show');
            
            $('#bm-map-canvas').height(getRealMapHeight());

            if (requestType == 'set')
            {
                navigator.geolocation.getCurrentPosition(
                    function(location)
                    {
                        position.savePosition(
                            new Coords(
                                location.coords.latitude,
                                location.coords.longitude,
                                location.coords.accuracy
                            )
                        );
                        
                        Map.requestLocation(location, positionName);
                        Map.displayMap(location, null, 'bm-map-canvas');
                        navigator.notification.alert(
                            'Your position has been saved',
                            function(){},
                            'Info'
                        );
                    },
                    function(error)
                    {
                        navigator.notification.alert(
                            'Unable to retrieve your position. Is your GPS enabled?',
                            function()
                            {
                                alert('Unable to retrieve the position: ' + error.message);
                            },
                            'Error'
                        );
                        $.mobile.pageContainer.pagecontainer('change', 'index.html');
                    },
                    geolocationOptions
                );
            }
            else
            {
                navigator.geolocation.watchPosition(
                    function(location)
                    {
                        Map.displayMap(location, position.getPositions()[positionIndex], 'bm-map-canvas');
                    },
                    function(){},
                    geolocationOptions
                );
            }
            
            console.log('requestType: ' + requestType)
        }
    );
    
    $(document).on(
        'pagecreate',
        '#bm-list-page',
        function()
        {
            createPositionsList('positions-list', (new Position()).getPositions());
        }
    );
}

function createPositionsList(idElement, positions)
{
    if (positions == null || positions.length == 0)
        return;

    $('#' + idElement).empty();
    var $listElement, $linkElement, dateTime, positionName;
    for(var i = 0; i < positions.length; i++)
    {
        $listElement = $('<li>');
        $linkElement = $('<a>');
        $linkElement
        .attr('href', '#')
        .click(
            function()
            {
                if (checkRequirements() === false)
                    return false;

                $.mobile.changePage(
                    'map.html',
                    {
                        data: {
                            requestType: 'get',
                            index: $(this).closest('li').index()
                        }
                    }
                );
            }
        );

        if (positions[i].address == '' || positions[i].address == null)
            $linkElement.text('Address not found');
        else
            $linkElement.text(positions[i].address);
        
        if (positions[i].name == '' || positions[i].name == null)
            positionName = 'Unnamed';
        else
            positionName = positions[i].name;
        
        dateTime = new Date(positions[i].datetime);
        $linkElement.text(
            positionName + ': ' + $linkElement.text() + ' @ ' +
            dateTime.toLocaleDateString() + ' ' +
            dateTime.toLocaleTimeString()
        );

        $listElement.append($linkElement);

        $linkElement = $('<a>');
        $linkElement.attr('href', '#')
        .text('Delete')
        .click(
            function()
            {
                var position = new Position();
                var oldLenght = position.getPositions().length;
                var $parentUl = $(this).closest('ul');

                position.deletePosition($(this).closest('li').index());
                if (oldLenght == position.getPositions().length + 1)
                {
                    $(this).closest('li').remove();
                    $parentUl.listview('refresh');
                }
                else
                {
                    navigator.notification.alert(
                        'Position not deleted. Something gone wrong so please try again.',
                        function(){},
                        'Error'
                    );
                }
            }
        );

        $listElement.append($linkElement);

        $('#' + idElement).append($listElement);
    }
    $('#' + idElement).listview('refresh');
}