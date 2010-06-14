$(window).ready(function () {
    var scriptSource, scriptPrefix, styleSource, stylePrefix, withShift = false;

    var toolbar = '<div class="panel"><select class="with-title" name="h" onchange="habraWYG.insertTagFromDropBox(this);" tabindex="-1"><option value="" class="title">Заголовок</option><option value="h4">H4</option><option value="h5">H5</option><option value="h6">H6</option></select><select class="with-title" name="list" onchange="habraWYG.insertList(this);" tabindex="-1"><option value="" class="title">Список</option><option value="ul">UL LI</option><option value="ol">OL LI</option></select><a style="margin-left: 10px;" title="жирный" onclick="return habraWYG.insertTagWithText(this, \'b\');" href="#" tabindex="-1"><img width="20" height="20" alt="Ж" src="/i/panel/bold_ru.gif"></a><a title="курсив" onclick="return habraWYG.insertTagWithText(this, \'i\');" href="#" tabindex="-1"><img width="20" height="20" alt="К" src="/i/panel/italic_ru.gif"></a><a title="подчёркнутый" onclick="return habraWYG.insertTagWithText(this, \'u\');" href="#" tabindex="-1"><img width="20" height="20" alt="__" src="/i/panel/underline_ru.gif"></a><a title="зачёркнутый" onclick="return habraWYG.insertTagWithText(this, \'s\');" href="#" tabindex="-1"><img width="20" height="20" alt="—" src="/i/panel/strikethrough.gif"></a><a style="margin: auto 10px;" title="код" onclick="return habraWYG.insertTagWithText(this, \'code\');" href="#" tabindex="-1" class="txt"><img width="30" height="20" alt="код" src="/i/panel/code.gif"></a><a title="хабраюзер" onclick="return habraWYG.insertUser(this);" href="#" tabindex="-1"><img width="20" height="20" alt="хабраюзер" src="/i/panel/user.gif"></a><a title="вставить ссылку" onclick="return habraWYG.insertLink(this);" href="#" tabindex="-1"><img width="20" height="20" alt="A" src="/i/panel/link.gif"></a><a title="вставить изображение" onclick="return habraWYG.insertImage(this);" href="#" tabindex="-1"><img width="20" height="20" alt="IMG" src="/i/panel/image.gif"></a><a title="вставить видео" onclick="return habraWYG.insertTagWithText(this, \'video\');" href="#" tabindex="-1"><img width="20" height="20" alt="video" src="/i/panel/video.gif"></a></div>';

    // Добавляем визуальный редактор к форме комментирования
    if (scriptSource = $('script[src$="commentForm.js"]').attr('src')) {
        scriptPrefix = scriptSource.replace(/\/commentForm\.js$/, '');

        if (styleSource = $('link[href$="all.css"]').attr('href')) {
            stylePrefix = styleSource.replace(/\/all\.css$/, '');

            $('head').append('<link rel="stylesheet" href="' + stylePrefix + '/forms.css" media="all" />');

            $.getScript(scriptPrefix + '/habraWYG.js', function () {
                $(document).bind('DOMNodeInserted', function (e) {            
                    if ($('.panel', $(e.target)) && $('#js-field-comment', $(e.target))) {
                        $('.panel', $(e.target)).width($('#js-field-comment', $(e.target)).outerWidth());
                    }                                    
                });

                $('[id^="reply_form"] form').wrapAll('<div class="editor" />');
                $('[id^="reply_form"] .editor').prepend(toolbar);
                $('[id^="reply_form"] .panel').width($('[id^="reply_form"] #js-field-comment').outerWidth());
            });
        }
    }

    // Функция добавления события по нажатию TAB
    $.fn.addTabClick = function () {
        $(this).bind('keydown', function (e) {
            if (16 == e.keyCode) {
                withShift = true;
            }

            if (9 == e.keyCode) {
                text = [], start = this.selectionStart, end = this.selectionEnd;

                text[0] = this.value.substring(0, start);

                text[1] = this.value.substring(start, end).replace(/\r/g, '');
                text[1] = text[1] ? text[1] : ' ';
                text[1] = (withShift ? text[1].replace('/^\t(.+)/gm', '$1') : text[1].replace('/^(.+)/gm', '\t$1'));

                text[2] = this.value.substring(end);

                this.value = text.join('');

                this.setSelectionRange(start + (withShift ? -1 : 1), start + text[1].length);

                return false;
            }
        }).bind('keyup', function (e) {
            if (16 == e.keyCode) {
                withShift = false;
            }
        });
    };

    // Добавляем нажатие TAB к форме комментирования
    $('[id^="reply_form"] form textarea').addTabClick();

    // Чиним нажатие TAB в форме добавления топика
    $('#topic-message').removeAttr('onkeydown').removeAttr('onkeyup').addTabClick();
});