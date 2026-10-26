<?php
/**
 * @var bool|null $snap  Snap to sections while scrolling (short pages only)
 */
$snap ??= false;
?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main" <?= $snap ? ' data-snap' : '' ?>>
            <?php if (!$page->isHomePage()): ?>
                <h1 class="visually-hidden"><?= $page->title()->esc() ?></h1>
            <?php endif ?>
            <?php foreach ($page->sections()->toBlocks()->values() as $index => $block): ?>
                <?= snippet('blocks/split', ['block' => $block, 'index' => $index]) ?>
            <?php endforeach ?>
        </main>
    </div>
</div>