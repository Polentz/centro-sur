<?php
$items = $page->entries()->toBlocks();
$fallback = $page->illustration()->toFile();
?>
<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<main class="main library">
    <div class="library-index">
        <div class="library-heading">
            <p><?= $page->title()->esc() ?> · <?= $items->count() ?></p>
            <!-- <p>Search</p> -->
        </div>
        <?php if ($items->isNotEmpty()): ?>
            <ul class="library-list">
                <?php foreach ($items as $item): ?>
                    <?php
                    $panelId = 'library-panel-' . $item->id();
                    $illustration = $item->illustration()->toFile() ?? $fallback;
                    $attachments = $item->attachments()->toFiles();
                    ?>
                    <li class="library-item">
                        <button class="library-row" type="button" aria-expanded="false" aria-controls="<?= $panelId ?>">
                            <span class="library-title"><?= $item->title()->esc() ?></span>
                            <span class="library-author"><?= $item->author()->esc() ?></span>
                            <span class="library-format"><?= $item->format()->esc() ?></span>
                            <span class="library-year"><?= $item->year()->esc() ?></span>
                        </button>
                        <div class="library-panel" id="<?= $panelId ?>">
                            <div class="library-panel-inner">
                                <div class="library-panel-text">
                                    <div class="library-info">
                                        <?php if ($item->info()->isNotEmpty()): ?>
                                            <p><?= $item->info()->esc() ?></p>
                                        <?php endif ?>
                                    </div>
                                    <?php if ($item->description()->isNotEmpty()): ?>
                                        <div class="library-description">
                                            <?= $item->description() ?>
                                        </div>
                                    <?php endif ?>
                                    <?php if ($item->link()->isNotEmpty() || $attachments->isNotEmpty()): ?>
                                        <ul class="library-links">
                                            <?php if ($item->link()->isNotEmpty()): ?>
                                                <li><a href="<?= $item->link()->esc('attr') ?>" target="_blank"
                                                        rel="noopener"><?= esc(parse_url($item->link()->value(), PHP_URL_HOST) ?: $item->link()->value()) ?></a>
                                                </li>
                                            <?php endif ?>
                                            <?php foreach ($attachments as $file): ?>
                                                <li><a href="<?= $file->url() ?>" download><?= $file->filename() ?></a></li>
                                            <?php endforeach ?>
                                        </ul>
                                    <?php endif ?>
                                </div>
                                <?php if ($illustration): ?>
                                    <figure class="library-illustration">
                                        <?= snippet('illustration', ['file' => $illustration, 'sizes' => '(max-width: 800px) 100vw, 50vw']) ?>
                                    </figure>
                                <?php endif ?>
                            </div>
                        </div>
                    </li>
                <?php endforeach ?>
            </ul>
        <?php endif ?>
    </div>
</main>

<?= snippet('footer') ?>
<?= snippet('language-menu') ?>
<?= snippet('foot') ?>