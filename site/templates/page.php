<?php
$sections = $page->sections()->toBlocks();
$snap = $sections->filterBy('type', 'index')->isEmpty();
?>
<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main" <?= $snap ? ' data-snap' : '' ?>>
            <?php $counts = []; ?>
            <?php foreach ($sections as $block): ?>
                <?php
                // Position among sections of the same type, so split sections keep
                // alternating sides even when a featured or index sits between them
                $index = $counts[$block->type()] = ($counts[$block->type()] ?? -1) + 1;
                ?>
                <?= snippet('blocks/' . $block->type(), ['block' => $block, 'index' => $index]) ?>
            <?php endforeach ?>
        </main>
        <?= snippet('footer') ?>
    </div>
</div>

<?= snippet('language-menu') ?>
<?= snippet('foot') ?>