<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<?= snippet('index-page', [
    'item' => 'blocks/library-item',
    'search' => 'title|author|format|year',
    'count' => 'library.items',
]) ?>

<?= snippet('language-menu') ?>
<?= snippet('foot') ?>