<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main" data-snap>
            <section class="intro-section section">
                <div class="section-logo" data-speed="0.7" aria-hidden="true">
                    <?= svg($page->logo()->toFile()) ?>
                </div>
                <div class="section-text">
                    <?= $page->intro()->kt() ?>
                </div>
            </section>
        </main>
    </div>
</div>

<?= snippet('footer') ?>
<?= snippet('foot') ?>