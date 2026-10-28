<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<?= snippet('index-page', [
    'item' => 'blocks/event',
    'search' => 'title|participants|category|place|from|to',
    'count' => 'projects.items',
]) ?>

<?= snippet('language-menu') ?>
<?= snippet('foot') ?>