<?php
use Kirby\Toolkit\I18n;
?>

<!DOCTYPE html>
<html lang="<?= I18n::locale() ?>">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>
        <?= $page->isHomePage() ? $site->title()->esc() : $page->title()->esc() . ($site->title()->isNotEmpty() ? ' · ' . $site->title()->esc() : '') ?>
    </title>
    <meta name="description" content="<?= $site->description() ?>">
    <link rel="canonical" href="<?= $page->url() ?>">
    <meta name="keywords" content="<?= $site->keywords() ?>">
    <meta property="og:locale" content="en">
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?= $site->title() ?>">
    <meta property="og:description" content="<?= $site->description() ?>">
    <meta property="og:url" content="<?= $page->url() ?>">
    <meta property="og:site_name" content="<?= $site->title() ?>">
    <?php if ($ogImage = $site->ogimage()->toFile()): ?>
        <meta property="og:image" content="<?= $ogImage->url() ?>">
    <?php endif ?>
    <meta name="robots" content="noindex,nofollow">
    <!-- <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"> -->
    <?php if ($favicon = $site->favicon()->toFile()): ?>
        <link href="<?= $favicon->url() ?>" rel="shortcut icon" type="image/x-icon">
        <link href="<?= $favicon->url() ?>" rel="apple-touch-icon">
    <?php endif ?>
    <link rel="stylesheet" href="https://use.typekit.net/gof7fem.css">
    <?= css([
        'assets/css/variables.css',
        'assets/css/base.css',
        'assets/css/style.css',
        '@auto',
    ]) ?>
    <noscript>Please turn on JS to navigate this website</noscript>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollTrigger.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollSmoother.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/MorphSVGPlugin.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/DrawSVGPlugin.min.js"></script>
    <?= js([
        'assets/js/script.js',
        '@auto',
    ], ['defer' => true]) ?>
</head>

<body>