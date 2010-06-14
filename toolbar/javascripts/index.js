var updateUserDataInterval, updateUserDataLoadingInterval;

var toolbarOrigin = 'Отсутствует связь с свервером или укажите ваше имя пользователя в настройках расширения';

var bars     = safari.extension.bars;
var visible  = safari.extension.settings.getItem('visible');

var interval = safari.extension.settings.getItem('interval');
var username = safari.extension.settings.getItem('username');

// Функция, которая обновляет данные пользователя для панели
updateUserData = function () {
    if ('' != username) {
        var z = 1;
        
        updateUserDataLoadingInterval = setInterval(function () {
            if (1 == z) {
                z++;
                
                $('body').empty().append('Загружаю информацию...');
            } else if (2 == z) {
                z++;
                
                $('body').empty().append('Загружаю информацию....');                
            } else if (3 == z) {
                z = 1;
                
                $('body').empty().append('Загружаю информацию.....');
            }
        }, 500);
        
        var api = topic = profile = false;
        
        // Получаем данные об изменении пользовательского рейтинга
        $.get('http://habrahabr.ru/api/profile/' + username + '/', function (apiData) {
            api = {
                karma    : $('karma', apiData).text(),
                rating   : $('rating', apiData).text(),
                position : $('ratingPosition', apiData).text()
            };
        });
        
        // Обновляем пользовательский аватар
        $.get('http://' + username + '.habrahabr.ru/', function (profileData) {        
            var avatar = $('#main-content .habrauserava img', profileData).attr('src');
                avatar = avatar.replace(/userpic\/avatar/gi, 'thumb');
                avatar = avatar.replace(/([\d]+)\.(gif|jpg|png)/gi, '$1/$1_24x24.$2');
                
            profile = {avatar : avatar};
        });

        // Получаем данные о последнем топике пользователя
        $.get('http://' + username + '.habrahabr.ru/blog/', function (topicData) {
            topic = {
                link      : $('#main-content .hentry:first .entry-info .comments a', topicData).attr('href'),
                title     : $('#main-content .hentry:first .entry-title .topic', topicData).text(),
                votes     : $('#main-content .hentry:first .entry-info .voting .mark span', topicData).text(),
                acomments : parseInt($('#main-content .hentry:first .entry-info .comments a .all', topicData).text()),
                ncomments : $('#main-content .hentry:first .entry-info .comments a .new', topicData).text()
            }
            
            topic.link = topic.link.replace(/#comments$/, '');
            topic.title = (topic.title.length > 50 ? topic.title.substring(0, 50) + '&hellip;' : topic.title);
        });
        
        var attempts = 0;
        
        (function () {
            try {
                if (typeof api != 'object' || typeof profile != 'object' || typeof topic != 'object') {
                    throw new Error;
                }
                
                clearInterval(updateUserDataLoadingInterval);

                $('body').empty();

                $('body').append('<img src="' + profile.avatar + '" width="16" height="16" id="avatar" alt="' + username + '" />');                
                $('body').append('&nbsp;&nbsp;<a href="http://' + username + '.habrahabr.ru/">' + username + '</a>');                
                $('body').append('<span title="Карма">Карма: ' + api.karma + '</span>&nbsp;&nbsp;');

                if (true == safari.extension.settings.getItem('toolbarRating')) {
                    $('body').append('<span title="Хабрасила">Хабрасила: ' + api.rating + '</span>&nbsp;&nbsp;');
                }

                if (true == safari.extension.settings.getItem('toolbarPosition')) {
                    $('body').append('<span title="Позиция в рейтинге">Позиция: ' + api.position + '</span>&nbsp;&nbsp;');
                }

                if (true == safari.extension.settings.getItem('toolbarTopic')) {
                    if (topic.link && topic.title) {
                        $('body').append('&nbsp;&nbsp;');

                        $('body').append('<a href="' + topic.link + '" title="' + topic.title + '">' + topic.title + '</a>');

                        $('body').append('&nbsp;&nbsp;');                    

                        $('body').append('<span title="Рейтинг">Рейтинг: ' + topic.votes + '</span>');                    

                        $('body').append('&nbsp;&nbsp;');

                        $('body').append('<span title="Комментарии">Комментарии: ' + (!topic.acomments ? 0 : topic.acomments));

                        if (topic.ncomments) {
                            $('body').append(' (' + topic.ncomments + ')');                        
                        }

                        $('body').append('</span>');
                    }    
                }            
            } catch (e) {
                attempts++;
                
                if (attempts < 100) {
                    return setTimeout(arguments.callee, 300);
                }

                newInterval(interval);
            }
        })();
    } else {
        emptyInterval();
    }
};

newInterval = function (i) {
    emptyInterval();

    updateUserData();
    
    updateUserDataInterval = setInterval(updateUserData, i * 60 * 1000);
};

emptyInterval = function () {
    clearInterval(updateUserDataInterval);
    clearInterval(updateUserDataLoadingInterval);

    $('body').empty().append(toolbarOrigin);
};

showHideBars = function () {
    for (var i = bars.length; i--;) {
        if (visible) {
            bars[i].show();    newInterval(interval);
        } else {
            bars[i].hide();    emptyInterval();
        }
    }
};

// Привязываем действие к событию command (нажатие кнопки)
safari.application.addEventListener('command', function (e) {
    if ('toggleToolbar' == e.command) {
        visible = !visible;
        
        showHideBars();
        
        safari.extension.settings.setItem('visible', visible);
    }
}, false);

// Привязываем действие к изменению настройки видимости панели 
safari.extension.settings.addEventListener('change', function (e) {
    if ('visible' == e.key) {
        visible = e.newValue;
        
        showHideBars();
    }
    
    if ('toolbarTopic' == e.key || 'toolbarRating' == e.key || 'toolbarPosition' == e.key) {
        showHideBars();
    }
}, false);

// Привязываем действие к событию смены имени пользователя
safari.extension.settings.addEventListener('change', function (e) {
    if ('interval' == e.key) {
        interval = e.newValue;
        
        newInterval(interval);
    }
    
    if ('username' == e.key) {
        if (username != e.newValue) {
            username = e.newValue;
            
            if ('' == username) {
                emptyInterval();
            } else {
                newInterval(interval);
            }
        }            
    }
}, false);

window.onload = function () {
    showHideBars();    
};