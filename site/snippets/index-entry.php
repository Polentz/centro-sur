<?php
$panelId = 'index-panel-' . $block->id();
$illustrations = $block->illustration()->toFiles();
$attachments = $block->attachments()->toFiles();
?>

<li class="index-item">
    <button class="index-row" type="button" aria-expanded="false" aria-controls="<?= $panelId ?>">
        <?php foreach ($cells as $slot => $value): ?>
            <span class="index-<?= $slot ?>"><?= esc($value ?? '') ?></span>
        <?php endforeach ?>
    </button>
    <div class="index-panel" id="<?= $panelId ?>">
        <div class="index-panel-inner">
            <div class="index-panel-text">
                <?php if ($info->isNotEmpty()): ?>
                    <div class="index-info">
                        <?= $info->kt() ?>
                    </div>
                <?php endif ?>
                <?php if ($block->description()->isNotEmpty()): ?>
                    <div class="index-description">
                        <?= $block->description()->kt() ?>
                    </div>
                <?php endif ?>
                <?php if ($block->link()->isNotEmpty() || $attachments->isNotEmpty()): ?>
                    <ul class="index-links">
                        <?php if ($block->link()->isNotEmpty()): ?>
                            <li><a href="<?= $block->link()->esc('attr') ?>" target="_blank"
                                    rel="noopener"><?= esc(parse_url($block->link()->value(), PHP_URL_HOST) ?: $block->link()->value()) ?></a>
                            </li>
                        <?php endif ?>
                        <?php foreach ($attachments as $file): ?>
                            <li><a href="<?= $file->url() ?>" download>Download</a></li>
                        <?php endforeach ?>
                    </ul>
                <?php endif ?>
            </div>
            <?php if ($illustrations->isNotEmpty()): ?>
                <div class="index-panel-illustration">
                    <figure class="index-gallery">
                        <?php foreach ($illustrations as $illustration): ?>
                            <?= snippet('illustration', ['file' => $illustration, 'sizes' => '(max-width: 800px) 100vw, 50vw']) ?>
                        <?php endforeach ?>
                    </figure>
                    <?php if ($illustrations->count() > 1): ?>
                        <div class="index-gallery-nav">
                            <button class="index-gallery-arrow" type="button" data-direction="-1" aria-label="Previous image"
                                disabled>
                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M15 4 7 12l8 8" />
                                </svg>
                            </button>
                            <button class="index-gallery-arrow" type="button" data-direction="1" aria-label="Next image">
                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M9 4l8 8-8 8" />
                                </svg>
                            </button>
                        </div>
                    <?php endif ?>
                </div>
            <?php endif ?>
        </div>
    </div>
</li>