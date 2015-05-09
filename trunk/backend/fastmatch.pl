#! /usr/bin/perl

use HTTP::Request;
use LWP::UserAgent;

my $json = '{"description":"FastMatch Division","judges":5,"current":0,"form":0,"forms":"finals:Taegeuk 7,Keumgang","athletes":["Piper","Anika","Saahitya"]}';
my $ua   = new LWP::UserAgent();
my $req  = new HTTP::Request( 'POST', 'http://freescore.net:3088/fastmatch' );
$req->header( 'Content-Type' => 'application/json' );
$req->content( $json );

my $response = $ua->request( $req );
if( $response->is_success ) {
	print $response->decoded_content;
}
