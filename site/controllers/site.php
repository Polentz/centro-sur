<?php

return function ($kirby) {
    if ($kirby->language()->code() == 'en') {
        $languageString = 'Es';
        $href = 'es';
    } else if ($kirby->language()->code() == 'es') {
        $languageString = 'En';
        $href = 'en';
    };

    return [
        'languageString' => $languageString,
        'href' => $href,
    ];
};
