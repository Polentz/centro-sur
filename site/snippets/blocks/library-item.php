<?php
$panelId = 'library-panel-' . $block->id();
$illustration = $block->cane()->toFile();
$illustrations = $block->illustration()->toFiles();
$attachments = $block->attachments()->toFiles();
?>
<li class="library-item">
    <button class="library-row" type="button" aria-expanded="false" aria-controls="<?= $panelId ?>">
        <span class="library-title"><?= $block->title()->esc() ?></span>
        <span class="library-author"><?= $block->author()->esc() ?></span>
        <span class="library-format"><?= $block->format()->esc() ?></span>
        <span class="library-year"><?= $block->year()->esc() ?></span>
    </button>
    <div class="library-panel" id="<?= $panelId ?>">
        <div class="library-panel-inner">
            <div class="library-panel-text">
                <div class="library-info">
                    <?php if ($block->info()->isNotEmpty()): ?>
                        <p><?= $block->info()->esc() ?></p>
                    <?php endif ?>
                </div>
                <?php if ($block->description()->isNotEmpty()): ?>
                    <div class="library-description">
                        <?= $block->description() ?>
                    </div>
                <?php endif ?>
                <?php if ($block->link()->isNotEmpty() || $attachments->isNotEmpty()): ?>
                    <ul class="library-links">
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
                <div class="library-panel-illustration">
                    <figure class="library-gallery">
                        <?php foreach ($illustrations as $illustration): ?>
                            <?= snippet('illustration', ['file' => $illustration, 'sizes' => '(max-width: 800px) 100vw, 50vw']) ?>
                        <?php endforeach ?>
                    </figure>
                    <?php if ($illustrations->count() > 1): ?>
                        <div class="library-gallery-nav">
                            <button class="library-gallery-arrow" type="button" data-direction="-1" aria-label="Previous image"
                                disabled>
                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M15 4 7 12l8 8" />
                                </svg>
                            </button>
                            <button class="library-gallery-arrow" type="button" data-direction="1" aria-label="Next image">
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