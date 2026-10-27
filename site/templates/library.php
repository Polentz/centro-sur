<?php
$items = $page->entries()->toBlocks();
$fallback = $page->illustration()->toFile();
?>
<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main" data-snap>
            <?php foreach ($page->sections()->toBlocks()->values() as $index => $block): ?>
                <?= snippet('blocks/split', ['block' => $block, 'index' => $index]) ?>
            <?php endforeach ?>
            <section class="library-index">
                <div class="library-heading">
                    <p><?= $page->title()->esc() ?> · <?= $items->count() ?></p>
                    <!-- <p>Search</p> -->
                </div>
                <?php if ($items->isNotEmpty()): ?>
                    <ul class="library-list">
                        <?php foreach ($items as $item): ?>
                            <?= snippet('blocks/library-item', ['block' => $item, 'fallback' => $fallback]) ?>
                        <?php endforeach ?>
                    </ul>
                <?php endif ?>
            </section>
        </main>
        <?= snippet('footer') ?>
    </div>
</div>


<?= snippet('language-menu') ?>
<?= snippet('foot') ?>