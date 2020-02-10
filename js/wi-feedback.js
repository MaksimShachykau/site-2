(function ($) {
    $(document).ready(function () {

        $.fn.wiFeedBack = function (options) {

            return this.each(function () {

                // Options
                var fb = $(this),
                    fbID = Math.floor(Math.random() * (899999) + 100000),
                    fbOpt = $.extend({
                        fbScript: '/wi-feedback.php',
                        fbLink: '.wi-fb-link',
                        fbBeforeOpen: null,
                        fbBeforeClose: null,
                        fbColor: '#7952b3',
                        fbTheme: true,
                        fbRecaptchaKey: null
                    }, options),
                    fbFieldInfo,
                    fbRecaptchaToken;

                // CSS
                if (fbOpt.fbColor) {
                    $('head').append('<style wi-fb-id="' + fbID + '">.wi-fb-' + fbID + ' .wi-fb-msg-sending,.wi-fb-' + fbID + ' .wi-fb-msg-sent,.wi-fb-' + fbID + ' .wi-fb-title h2,.wi-fb-' + fbID + ' .wi-fb-title .h2{color:' + fbOpt.fbColor + '}.wi-fb-' + fbID + ' .wi-fb-btn button,.wi-fb-btn .button{background:' + fbOpt.fbColor + '}</style>');
                }

                // Classes
                fb.addClass('wi-fb wi-fb-' + fbID).attr('wi-fb-id', fbID);

                // Theme
                if (fbOpt.fbTheme) {
                    fb.addClass('wi-fb-theme');
                }

                // Elements
                fb.find('h2, h3, .h2, .h3').wrap('<div class="wi-fb-title"></div>');
                fb.find('p').wrap('<div class="wi-fb-text"></div>');
                fb.find('input, select, textarea').wrap('<div class="wi-fb-line"></div>');
                fb.find('input, select, textarea').each(function () {
                    var label = $(this).attr('data-wi-fb-label') || $(this).attr('data-label');
                    if (label != '' && typeof (label) != 'undefined') {
                        $(this).parent().prepend('<label>' + label + '</label>');
                        if ($(this).prop('required')) {
                            $(this).parent().find('label').append('<span> *</span>');
                        }
                    }
                });
                fb.find('button, .button').prepend('<i class="wi-fb-spinner"></i>').wrap('<div class="wi-fb-btn"></div>');

                // Messages
                if (/ru/i.test($('html').attr('lang'))) {
                    fb.append('<div class="wi-fb-msg-invalid">Отмеченные поля заполнены некорректно</div><div class="wi-fb-msg-sent">Ваша заявка принята!</div><div class="wi-fb-msg-notsent">При отправке данных произошла ошибка</div>');
                } else {
                    fb.append('<div class="wi-fb-msg-invalid">Marked fields are required</div><div class="wi-fb-msg-sent">Your request is sent!</div><div class="wi-fb-msg-notsent">An error occurred while sending data</div>');
                }

                // Uploads
                fb.find('input[type="file"]').each(function () {

                    var uplInpFile = $(this);

                    uplInpFile.wrap('<div class="wi-fb-file"></div>');
                    var uplWr = uplInpFile.parent();

                    uplWr.append('<input type="hidden"><label></label>');
                    var uplLabel = uplWr.find('label'),
                        uplInp = uplWr.find('input[type="hidden"]');

                    uplInp.attr('name', uplInpFile.attr('data-wi-fb-caption') || uplInpFile.attr('wi-fb-caption') || uplInpFile.attr('name'));

                    uplInpFile.on('change', function () {

                        var fd = new FormData();

                        fd.append('action', 'upload');
                        fd.append('file', $(this)[0].files[0]);

                        $.ajax({
                            url: fbOpt.fbScript,
                            data: fd,
                            processData: false,
                            contentType: false,
                            type: 'POST',
                            success: function (res) {
                                uplLabel.text('');
                                if (res.statusText) {
                                    uplLabel.text(res.statusText);
                                }
                                if (res.fileName) {
                                    uplInp.val((window.location.protocol + '//' + window.location.host + '/' + fbOpt.fbScript + '/' + res.fileName).replace('wi-feedback.php', 'uploads'));
                                }
                            }
                        });
                    });
                });

                // Send Data
                fb.find('.wi-fb-btn button, .wi-fb-btn .button').on('click', function () {

                    fb.removeClass('invalid sent notsent');

                    if (fbValidate()) {

                        var data = {},
                            fields = [];

                        if (fbRecaptchaToken) {
                            data.rct = fbRecaptchaToken;
                        }

                        fb.find('input, select, textarea').each(function () {
                            if ($(this).attr('type') != 'file') {
                                var field = {
                                    name: $(this).attr('data-wi-fb-caption') || $(this).attr('wi-fb-caption') || $(this).attr('name'),
                                    value: $(this).val()
                                }
                                if ($(this).attr('type') == 'email' && $(this).val().search(/.+@.+\..+/i) != -1) {
                                    field.replyTo = true;
                                }
                                fields.push(field);
                            }
                        });

                        if (fbFieldInfo) {
                            fields.push({
                                name: 'Дополнительная информация',
                                value: fbFieldInfo
                            });
                        }

                        fields.push({
                            name: 'Адрес страницы',
                            value: window.location.href
                        });

                        data.action = 'feedback';
                        data.fields = fields;

                        fb.addClass('sending');

                        $.ajax({
                            url: fbOpt.fbScript,
                            type: 'POST',
                            data: data,
                            cache: false,
                            success: function (response) {
                                if (response.trim() == '1') {
                                    fb.removeClass('sending');
                                    fb.addClass('sent');
                                    fbClear();
                                } else {
                                    fb.removeClass('sending');
                                    fb.addClass('notsent');
                                }
                            },
                            error: function () {
                                fb.removeClass('sending');
                                fb.addClass('notsent');
                            }
                        });
                    } else {

                        fb.addClass('invalid');
                    }
                });

                // Popup
                if (fbOpt.fbLink) {

                    fb.addClass('wi-fb-modal mfp-hide');

                    var mfpOpt = {
                        items: {
                            src: fb,
                            type: 'inline'
                        },
                        removalDelay: 250,
                        mainClass: 'mfp-fade',
                        fixedContentPos: true,
                        callbacks: {}
                    }

                    if (typeof (fbOpt.fbBeforeOpen) == 'function') {
                        mfpOpt.callbacks.open = fbOpt.fbBeforeOpen;
                    }

                    if (typeof (fbOpt.fbBeforeClose) == 'function') {
                        mfpOpt.callbacks.close = fbOpt.fbBeforeClose;
                    }

                    $('body').on('click', fbOpt.fbLink, function (e) {
                        e.preventDefault();
                        fb.removeClass('sent notsent');
                        fbFieldInfo = $(this).attr('data-wi-fb-info') || $(this).attr('wi-fb-info') || $(this).attr('data-label') || '';
                        $.magnificPopup.open(mfpOpt);
                    });
                }

                // Recapcha
                if (fbOpt.fbRecaptchaKey) {
                    jQuery.getScript('https://www.google.com/recaptcha/api.js?render=' + fbOpt.fbRecaptchaKey).then(function () {
                        grecaptcha.ready(function () {
                            grecaptcha.execute(fbOpt.fbRecaptchaKey, {
                                action: fb.attr('id').replace(/[-]{1}/ig, '_')
                            }).then(function (token) {
                                fbRecaptchaToken = token;
                            });
                        });
                    });
                }

                // Validation
                function fbValidate() {

                    var invalidNum = 0;

                    fb.find('input, select, textarea').each(function () {
                        if (!$(this).get(0).checkValidity()) invalidNum++;
                    });

                    return invalidNum == 0;
                }

                // Check
                function fbClear() {

                    fb.find('input, select, textarea').each(function () {
                        $(this).val('');
                    });
                }
            });
        }
    });
})(jQuery);