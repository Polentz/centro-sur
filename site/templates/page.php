<?php
/**
 * Main template for all content pages (Home, pages, Projects, Meta-Library…).
 * The page is built from the "Sections" blocks, rendered in the order set in the Panel.
 */
$sections = $page->sections()->toBlocks();
// Snapping only suits short sections: turn it off when the page has a table
$snap = $sections->filterBy('type', 'index')->isEmpty();
?>
<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main"<?= $snap ? ' data-snap' : '' ?>>
            <?php foreach ($sections->values() as $index => $block): ?>
                <?= snippet('blocks/' . $block->type(), ['block' => $block, 'index' => $index]) ?>
            <?php endforeach ?>
        </main>
        <?= snippet('footer') ?>
    </div>
</div>

<?= snippet('language-menu') ?>
<?= snippet('foot') ?>
