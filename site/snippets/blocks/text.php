<div class="section-text">
    <?php if ($block->heading()->isNotEmpty()): ?>
        <h2 class="section-heading"><?= $block->heading()->esc() ?></h2>
    <?php endif ?>
    <?php if ($block->text()->isNotEmpty()): ?>
        <?= $block->text() ?>
    <?php endif ?>
</div>