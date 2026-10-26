<?php
$illustration = $page->illustration()->toFile() ?? $page->parent()?->illustration()->toFile();
?>
<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main">
            <article class="section split-section">
                <?php if ($illustration): ?>
                    <div class="section-logo" data-speed="0.7">
                        <?= snippet('illustration', ['file' => $illustration]) ?>
                    </div>
                <?php endif ?>
                <div class="section-text">
                    <p class="section-heading library-caption">
                        <span><?= $page->format()->esc() ?></span>
                        <span><?= $page->year()->esc() ?></span>
                    </p>
                    <h1 class="library-item-title"><?= $page->title()->esc() ?></h1>
                    <?php if ($page->author()->isNotEmpty()): ?>
                        <p class="library-item-author"><?= $page->author()->esc() ?></p>
                    <?php endif ?>
                    <?= $page->description() ?>
                    <?php if ($page->link()->isNotEmpty() || $page->attachments()->isNotEmpty()): ?>
                        <ul class="library-item-links">
                            <?php if ($page->link()->isNotEmpty()): ?>
                                <li><a href="<?= $page->link()->esc('attr') ?>" target="_blank" rel="noopener"><?= esc(parse_url($page->link()->value(), PHP_URL_HOST) ?: $page->link()->value()) ?></a></li>
                            <?php endif ?>
                            <?php foreach ($page->attachments()->toFiles() as $file): ?>
                                <li><a href="<?= $file->url() ?>" download><?= $file->filename() ?></a></li>
                            <?php endforeach ?>
                        </ul>
                    <?php endif ?>
                    <?php if ($parent = $page->parent()): ?>
                        <p class="library-item-back"><a href="<?= $parent->url() ?>">← <?= $parent->title()->esc() ?></a></p>
                    <?php endif ?>
                </div>
            </article>
        </main>
    </div>
</div>

<?= snippet('footer') ?>
<?= snippet('foot') ?>
