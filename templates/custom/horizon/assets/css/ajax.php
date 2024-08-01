<?php header("Content-type: text/css"); ?>
<!--
.loading {
	position: absolute;
	background-color:<?php echo $config->getConfig('bkg_color'); ?>;
	top: 50%;
	left: 50%;
	width: 28px;
	height: 28px;
	margin: -14px 0 0 -14px;
}

/* Spinning circle (inner circle) */
.loading .maskedCircle {
	width: 20px;
	height: 20px;
	border-radius: 12px;
	border: 3px solid <?php echo $config->getConfig('text_color2'); ?>;
}

/* Spinning circle mask */
.loading .mask {
	width: 12px;
	height: 12px;
	overflow: hidden;
}

/* Spinner */
.loading .spinner {
	position: absolute;
	left: 1px;
	top: 1px;
	width: 26px;
	height: 26px;
	animation: spin 1s infinite linear;
}
-->


<!-- Loading animation container -->
<div class="loading">
	<!-- We make this div spin -->
	<div class="spinner">
		<!-- Mask of the quarter of circle -->
		<div class="mask">
			<!-- Inner masked circle -->
			<div class="maskedCircle"></div>
		</div>
	</div>
</div>
