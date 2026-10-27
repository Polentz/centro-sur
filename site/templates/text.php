<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main" data-snap>
            <section class="section text-section">
                <?php foreach ($page->sections()->toBlocks() as $block): ?>
                    <?= snippet('blocks/text', ['block' => $block]) ?>
                <?php endforeach ?>
            </section>
        </main>
        <?= snippet('footer') ?>
    </div>
</div>

<?= snippet('language-menu') ?>
<?= snippet('foot') ?>