<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main">
            <h1 class="visually-hidden"><?= $page->title()->esc() ?></h1>
            <?php foreach ($page->sections()->toBlocks()->values() as $index => $block): ?>
                <?= snippet('blocks/split', ['block' => $block, 'index' => $index]) ?>
            <?php endforeach ?>
        </main>
    </div>
</div>

<?= snippet('footer') ?>
<?= snippet('foot') ?>
