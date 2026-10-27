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