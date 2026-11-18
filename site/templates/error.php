<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main">
            <section class="section error-section">
                <p class="error-code" aria-hidden="true">404</p>
                <h1 class="section-heading"><?= t('error.title') ?></h1>
                <p class="error-text"><?= t('error.text') ?></p>
                <a class="error-link" href="<?= $site->homePage()->url() ?>"><?= t('error.home') ?></a>
            </section>
        </main>
        <?= snippet('footer') ?>
    </div>
</div>

<?= snippet('language-menu') ?>
<?= snippet('foot') ?>
