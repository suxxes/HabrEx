var loaded  = [];
var loading = false;
var domain  = window.location.href.substring(0, window.location.href.indexOf('/', 8));

$(document).bind('scroll', function (e) {
    safari.self.tab.dispatchMessage('getSettings');

    if (true == extSettings.paginate && 0 < $('.page-nav .next').length && 0 < $('.hentry').length) {
        if ($(document).scrollTop() + 500 > $('.page-nav .next').offset().top) {
            var href = $('.page-nav .next').attr('href');

            if (false == loading) {
                href = (-1 == href.indexOf('http://') ? domain + href : href);

                if (-1 == loaded.indexOf(href)) {
                    loading = true;

                    $.get(href, function (nextPageData) {                    
                        $('.page-nav').replaceWith($(nextPageData).find('.hentry'));
                        $('.hentry:last').after($(nextPageData).find('.page-nav'));

                        if (!$('.page-nav .next').attr('href')) {
                            $('.page-nav').remove();
                        }

                        loaded.push(href);

                        loading = false;
                    });
                }
            }
        }
    }
});

if ($('.page-nav .next') && $(document).scrollTop() + 500 > $('.page-nav .next').offset().top) {
    $(document).trigger('scroll');
}