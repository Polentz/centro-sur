<?php
/**
 * @var bool|null $snap  Snap to sections while scrolling (short pages only)
 * <?= $snap ? ' data-snap' : '' ?>
 */
$snap ??= false;
?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main" data-snap>
            <?php foreach ($page->sections()->toBlocks()->values() as $index => $block): ?>
                <?= snippet('blocks/split', ['block' => $block, 'index' => $index]) ?>
            <?php endforeach ?>
        </main>
        <?= snippet('footer') ?>
    </div>
</div>