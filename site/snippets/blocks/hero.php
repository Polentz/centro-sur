<?php
/**
 * Hero section: a bordered frame highlighting one or more featured items.
 * More than one item turns the frame into a slideshow (see heroSlideshow in script.js).
 */
$items = $block->items()->toBlocks();
if ($items->isEmpty())
    return;

$total = $items->count();
$slideshow = $total > 1;
$autoplay = (int) $block->autoplay()->value();
?>
<section class="section hero-section">
    <div class="hero-frame" <?php if ($slideshow): ?> data-slideshow<?= $autoplay ? ' data-autoplay="' . $autoplay * 1000 . '"' : '' ?> role="region" aria-roledescription="carousel" aria-label="<?= t('hero.label') ?>" <?php endif ?>>
        <div class="hero-slides">
            <?php foreach ($items->values() as $i => $item): ?>
                <?php
                $image = $item->image()->toFile();
                $url = $item->link()->isNotEmpty() ? $item->link()->toUrl() : null;
                $external = $url && !str_starts_with($url, $site->url()) && !str_starts_with($url, 'mailto:');
                ?>
                <article class="hero-slide<?= $i === 0 ? ' is-active' : '' ?><?= $image ? '' : ' hero-slide--text' ?>" <?php if ($slideshow): ?> role="group" aria-roledescription="slide" aria-label="<?= $i + 1 ?> / <?= $total ?>"
                        <?= $i > 0 ? ' inert' : '' ?>     <?php endif ?>>
                    <?php if ($image): ?>
                        <div class="hero-media">
                            <?= snippet('illustration', ['file' => $image, 'sizes' => '(max-width: 800px) 80vw, 40vw']) ?>
                        </div>
                    <?php endif ?>
                    <div class="hero-copy">
                        <?php if ($item->label()->isNotEmpty()): ?>
                            <p class="hero-label"><?= $item->label()->esc() ?></p>
                        <?php endif ?>
                        <h2 class="hero-title"><?= $item->title()->esc() ?></h2>
                        <?php if ($item->text()->isNotEmpty()): ?>
                            <div class="hero-text"><?= $item->text() ?></div>
                        <?php endif ?>
                        <?php if ($url): ?>
                            <p class="hero-link"><a href="<?= esc($url, 'attr') ?>" <?= $external ? ' target="_blank" rel="noopener"' : '' ?>><?= $item->linkText()->or(t('hero.more'))->esc() ?></a></p>
                        <?php endif ?>
                    </div>
                </article>
            <?php endforeach ?>
        </div>
        <?php if ($slideshow): ?>
            <div class="hero-controls">
                <p class="hero-counter" aria-live="polite"><span class="hero-current">01</span> /
                    <?= str_pad($total, 2, '0', STR_PAD_LEFT) ?>
                </p>
                <button class="hero-arrow" type="button" data-direction="-1" aria-label="<?= t('hero.previous') ?>">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M15 4 7 12l8 8" />
                    </svg>
                </button>
                <button class="hero-arrow" type="button" data-direction="1" aria-label="<?= t('hero.next') ?>">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M9 4l8 8-8 8" />
                    </svg>
                </button>
            </div>
        <?php endif ?>
    </div>
</section>