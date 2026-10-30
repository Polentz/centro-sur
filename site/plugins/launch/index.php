<?php

use Kirby\Cms\App as Kirby;

/**
 * Two addresses, one Kirby install:
 * - review.centrosur.org (any host starting with "review.") always shows the full site
 * - centrosur.org shows the landing page until "Website is live" is switched on in the Panel
 *   (logged-in Panel users see the full site there too)
 */
Kirby::plugin('centro-sur/launch', [
    'siteMethods' => [
        'isReview' => function (): bool {
            return str_starts_with(kirby()->environment()->host() ?? '', 'review.');
        },
    ],
    'routes' => [
        [
            'pattern' => '(:all)',
            'action' => function (string $path = '') {
                $kirby   = kirby();
                $site    = $kirby->site();
                $landing = page('landing-page');

                if ($site->isReview() || $site->launched()->toBool() || $kirby->user() || !$landing) {
                    return $this->next();
                }

                // Work out the language from the first URL segment ("es/..."), default otherwise
                $segments = explode('/', trim($path, '/'));
                $language = $kirby->languages()->find($segments[0]);

                if ($language && !$language->isDefault()) {
                    array_shift($segments);
                } else {
                    $language = $kirby->defaultLanguage();
                }

                if (implode('/', $segments) === '') {
                    return $site->visit($landing, $language->code());
                }

                return go($language->url());
            }
        ],
    ],
]);
