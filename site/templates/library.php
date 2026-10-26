<?php
$items = $page->children()->listed();
$fallback = $page->illustration()->toFile();
?>
<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<main class="main library">
    <div class="library-preview" aria-hidden="true">
        <?php foreach ($items->values() as $index => $item): ?>
            <?php $illustration = $item->illustration()->toFile() ?? $fallback ?>
            <figure class="library-preview-item<?= $index === 0 ? ' is-active' : '' ?>" data-item="<?= $item->slug() ?>">
                <?php if ($illustration): ?>
                    <?= snippet('illustration', ['file' => $illustration, 'sizes' => '560px']) ?>
                <?php endif ?>
                <figcaption class="library-caption">
                    <span><?= $item->format()->esc() ?></span>
                    <span><?= $item->year()->esc() ?></span>
                </figcaption>
            </figure>
        <?php endforeach ?>
    </div>

    <div class="library-index">
        <h2 class="library-heading"><?= $page->title()->esc() ?> · <?= $items->count() ?></h2>
        <?php if ($items->isNotEmpty()): ?>
            <ul class="library-list">
                <?php foreach ($items->values() as $index => $item): ?>
                    <li>
                        <a class="library-row<?= $index === 0 ? ' is-active' : '' ?>" href="<?= $item->url() ?>"
                            data-item="<?= $item->slug() ?>">
                            <span class="library-title"><?= $item->title()->esc() ?></span>
                            <span class="library-author"><?= $item->author()->esc() ?></span>
                            <span class="library-year"><?= $item->year()->esc() ?></span>
                        </a>
                    </li>
                <?php endforeach ?>
            </ul>
        <?php endif ?>
    </div>
</main>

<?= snippet('footer') ?>
<?= snippet('foot') ?>