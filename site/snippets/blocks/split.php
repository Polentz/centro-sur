<?php
$index ??= 0;
$side = $block->side()->or('auto')->value();
$flip = $side === 'right' || ($side === 'auto' && $index % 2 === 1);
$illustration = $block->illustration()->toFile();
?>
<section class="section split-section<?= $flip ? ' split-section--flip' : '' ?>">
    <?php if ($illustration): ?>
        <div class="section-logo" data-speed="0.7">
            <?= snippet('illustration', ['file' => $illustration]) ?>
        </div>
    <?php endif ?>
    <?php if ($block->text()->isNotEmpty() || $block->heading()->isNotEmpty()): ?>
        <div class="section-text">
            <?php if ($block->heading()->isNotEmpty()): ?>
                <h2 class="section-heading"><?= $block->heading()->esc() ?></h2>
            <?php endif ?>
            <?php if ($block->text()->isNotEmpty()): ?>
                <?= $block->text() ?>
            <?php endif ?>
        </div>
    <?php endif ?>
</section>